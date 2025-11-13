<?php
// app/Http/Controllers/API/CreateAccountController.php
namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\AccountService;
use Illuminate\Http\Request;
use App\Http\Resources\AccountResource;
use Illuminate\Http\Response;

class CreateAccountController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function __invoke(Request $request)
    {
        // First validate the request
        $validated = $request->validate([
            'reference' => 'required|string|max:255|unique:accounts,reference',
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:standard,mpesa_offline',
            'account_type_id' => 'required|integer|exists:account_types,id',
            'account_subtype_id' => 'required|integer|exists:account_subtypes,id',
            'metadata' => 'sometimes|array'
        ]);

        try {
            // Create the account using the service
            $account = $this->accountService->createAccount($validated);
            
            // Return the newly created account as a resource
            return (new AccountResource($account))
                ->response()
                ->setStatusCode(Response::HTTP_CREATED);
                
        } catch (\Exception $e) {
            // Log the error
            \Log::error('Account creation failed', [
                'error' => $e->getMessage(),
                'data' => $validated
            ]);
            
            return response()->json([
                'message' => 'Failed to create account',
                'error' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }
}