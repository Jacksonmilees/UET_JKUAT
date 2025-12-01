<?php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Account;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Traits\ApiResponses;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
}