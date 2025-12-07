<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\MemberIdService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Transaction;
use Carbon\Carbon;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Log incoming request for debugging
        Log::info('Registration attempt', [
            'request_data' => $request->except(['password']),
            'content_type' => $request->header('Content-Type'),
        ]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phoneNumber' => 'nullable|string|max:20|unique:users,phone_number',
            'yearOfStudy' => 'nullable|string|max:50',
            'course' => 'nullable|string|max:255',
            'college' => 'nullable|string|max:255',
            'admissionNumber' => 'nullable|string|max:50|unique:users,admission_number',
            'ministryInterest' => 'nullable|string|max:255',
            'residence' => 'nullable|string|max:255',
        ], [
            'email.unique' => 'This email is already registered. Please use a different email or login.',
            'phoneNumber.unique' => 'This phone number is already registered. Please use a different number.',
            'admissionNumber.unique' => 'This admission number is already registered.',
            'password.min' => 'Password must be at least 6 characters long.',
        ]);

        if ($validator->fails()) {
            Log::error('Registration validation failed', [
                'errors' => $validator->errors()->toArray(),
                'request_data' => $request->except(['password']),
                'all_input' => $request->all(),
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Generate unique member ID
            $memberId = MemberIdService::generate();
            $token = Str::random(60);

            // Determine role
            $role = ($request->get('email') === 'admin@uetjkuat.com') ? 'admin' : 'user';

            $user = User::create([
                'name' => $request->get('name'),
                'email' => $request->get('email'),
                'password' => Hash::make($request->get('password')),
                'member_id' => $memberId,
                'phone_number' => $request->get('phoneNumber'),
                'year_of_study' => $request->get('yearOfStudy'),
                'course' => $request->get('course'),
                'college' => $request->get('college'),
                'admission_number' => $request->get('admissionNumber'),
                'ministry_interest' => $request->get('ministryInterest'),
                'residence' => $request->get('residence'),
                'role' => $role,
                'status' => 'active',
                'registration_completed_at' => Carbon::now(),
                'remember_token' => $token,
            ]);

            Log::info('User registered successfully', [
                'user_id' => $user->id,
                'member_id' => $memberId,
                'email' => $user->email,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => array_merge(
                        $user->getProfileData(),
                        $this->getMandatoryStatus($user->id)
                    ),
                    'token' => $token,
                ],
                'message' => 'Registration successful! Your member ID is: ' . $memberId,
            ]);
        } catch (\Exception $e) {
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->except(['password']),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->get('email'))->first();
        if (!$user || !Hash::check($request->get('password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Issue/refresh a simple token via remember_token
        $token = Str::random(60);
        $user->remember_token = $token;
        $user->save();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => array_merge(
                    $user->getProfileData(),
                    $this->getMandatoryStatus($user->id)
                ),
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $authHeader = $request->header('Authorization');
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $token = substr($authHeader, 7);

        $user = User::where('remember_token', $token)->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        return response()->json([
            'success' => true,
            'data' => array_merge(
                $user->getProfileData(),
                $this->getMandatoryStatus($user->id)
            ),
        ]);
    }

    /**
     * Compute mandatory contribution status for a user from transactions tagged mandatory_contribution.
     */
    private function getMandatoryStatus(int $userId): array
    {
        $latest = Transaction::where('metadata->purpose', 'mandatory_contribution')
            ->where('metadata->user_id', $userId)
            ->latest()
            ->first();

        $paid = $latest && $latest->status === 'completed';

        return [
            'mandatory_paid' => $paid,
            'mandatory_amount' => 100,
            'mandatory_last_payment_date' => $paid ? ($latest->processed_at?->toDateTimeString() ?? $latest->updated_at?->toDateTimeString()) : null,
        ];
    }
}


