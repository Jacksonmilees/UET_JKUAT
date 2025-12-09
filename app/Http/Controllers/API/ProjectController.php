<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Account;
use App\Services\MpesaService;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Traits\ApiResponses;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    use ApiResponses;

    public function index()
    {
        try {
            $projects = Project::with('donations')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->successResponse($projects);
        } catch (\Exception $e) {
            Log::error('Error fetching projects: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    public function store(StoreProjectRequest $request)
    {
        try {
            DB::beginTransaction();

            Log::debug('Request received:', [
                'all_data' => $request->all(),
                'headers' => $request->headers->all(),
                'method' => $request->method()
            ]);

            $validated = $request->validated();
            Log::debug('Data validated:', ['validated' => $validated]);

            $validated['current_amount'] = $validated['current_amount'] ?? 0;
            $validated['status'] = $validated['status'] ?? 'active';

            Log::debug('Attempting to create project', ['data' => $validated]);
            
            $project = Project::create($validated);
            
            if (!$project) {
                Log::error('Project creation failed');
                throw new \Exception('Failed to create project');
            }

            // Auto-create account for this project
            $accountReference = $this->generateProjectAccountReference($project->name);
            
            // Get or create account type
            $accountType = DB::table('account_types')->where('code', 'GEN')->first();
            if (!$accountType) {
                $accountTypeId = DB::table('account_types')->insertGetId([
                    'name' => 'General',
                    'code' => 'GEN',
                    'description' => 'General Account',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $accountTypeId = $accountType->id;
            }

            $accountSubtype = DB::table('account_subtypes')->where('code', 'PROJ')->first();
            if (!$accountSubtype) {
                $accountSubtypeId = DB::table('account_subtypes')->insertGetId([
                    'account_type_id' => $accountTypeId,
                    'name' => 'Project',
                    'code' => 'PROJ',
                    'description' => 'Project Account',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            } else {
                $accountSubtypeId = $accountSubtype->id;
            }

            $account = Account::create([
                'reference' => $accountReference,
                'name' => $project->name . ' Account',
                'account_type_id' => $accountTypeId,
                'account_subtype_id' => $accountSubtypeId,
                'type' => 'project',
                'balance' => 0,
                'status' => 'active',
                'metadata' => [
                    'project_id' => $project->id,
                    'project_name' => $project->name,
                    'auto_created' => true,
                    'created_at' => now()->toDateTimeString()
                ]
            ]);

            // Update project with account reference
            $project->account_reference = $accountReference;
            $project->save();

            DB::commit();

            Log::info('Project and account created:', [
                'project_id' => $project->id,
                'account_reference' => $accountReference
            ]);
            
            return $this->successResponse([
                'project' => $project,
                'account' => $account
            ], 'Project and account created successfully', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Error in store method:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Generate unique account reference for project
     */
    private function generateProjectAccountReference($projectName)
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $projectName), 0, 5));
        $unique = strtoupper(Str::random(4));
        $reference = "PROJ-{$prefix}-{$unique}";

        while (Account::where('reference', $reference)->exists()) {
            $unique = strtoupper(Str::random(4));
            $reference = "PROJ-{$prefix}-{$unique}";
        }

        return $reference;
    }

    public function show(Project $project)
    {
        return $this->successResponse($project->load('donations'));
    }

    /**
     * List donations for a given project (public).
     */
    public function donations(Project $project)
    {
        $donations = $project->donations()->latest()->get();
        return $this->successResponse($donations);
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());
        return $this->successResponse($project, 'Project updated successfully');
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return $this->successResponse(null, 'Project deleted successfully');
    }

    /**
     * Public donation - no authentication required
     * Allows anyone to donate to a project via M-Pesa
     */
    public function publicDonate(Request $request, int $id)
    {
        $project = Project::find($id);
        
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Project not found',
            ], 404);
        }

        if ($project->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'This project is no longer accepting donations',
            ], 400);
        }

        $validated = $request->validate([
            'phone' => 'required|string',
            'amount' => 'required|numeric|min:1',
            'donor_name' => 'required|string|max:100',
            'message' => 'nullable|string|max:500',
        ]);

        // Normalize phone number
        $phone = preg_replace('/[^0-9]/', '', $validated['phone']);
        if (strlen($phone) === 9) {
            $phone = '254' . $phone;
        } elseif (strlen($phone) === 10 && str_starts_with($phone, '0')) {
            $phone = '254' . substr($phone, 1);
        }

        // Validate it's a Kenyan Safaricom number
        if (!preg_match('/^2547\d{8}$/', $phone)) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid Safaricom phone number',
            ], 422);
        }

        try {
            $mpesaService = app(MpesaService::class);
            
            $response = $mpesaService->stkPush(
                $phone,
                $validated['amount'],
                "Donation to {$project->name} from {$validated['donor_name']}",
                'PublicDonationCallback',
                [
                    'project_id' => $project->id,
                    'donor_name' => $validated['donor_name'],
                    'donor_phone' => $phone,
                    'message' => $validated['message'] ?? null,
                    'is_public_donation' => true,
                ]
            );

            if (isset($response['CheckoutRequestID'])) {
                Log::info("Public donation STK Push sent", [
                    'project_id' => $project->id,
                    'donor_name' => $validated['donor_name'],
                    'amount' => $validated['amount'],
                    'checkout_request_id' => $response['CheckoutRequestID'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment initiated. Please check your phone for M-Pesa prompt.',
                    'data' => [
                        'checkout_request_id' => $response['CheckoutRequestID'],
                    ],
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment. Please try again.',
            ], 500);
        } catch (\Exception $e) {
            Log::error("Public donation failed", [
                'error' => $e->getMessage(),
                'project_id' => $project->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment service error. Please try again later.',
            ], 500);
        }
    }
}