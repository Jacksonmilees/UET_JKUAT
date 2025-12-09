<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class OTPAuthController extends Controller
{
    private $otpServiceUrl;

    public function __construct()
    {
        // WhatsApp OTP service URL
        $this->otpServiceUrl = env('OTP_SERVICE_URL', 'http://localhost:5001');
    }

    /**
     * Request OTP for login
     * User provides email or phone number
     */
    public function requestOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required|string', // Can be email or phone
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $identifier = $request->identifier;

        // Check if user exists by email or phone
        $user = User::where('email', $identifier)
            ->orWhere('phone_number', $identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found. Please register first.',
                'error' => 'USER_NOT_FOUND'
            ], 404);
        }

        // Determine if identifier is phone or email
        $isPhone = preg_match('/^[0-9+]+$/', $identifier);
        
        try {
            // Call WhatsApp OTP service with retry logic
            $maxRetries = 3;
            $response = null;
            $lastException = null;
            
            for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
                try {
                    \Log::info("OTP Request attempt {$attempt} to {$this->otpServiceUrl}/send-otp");
                    
                    $response = Http::timeout(30)
                        ->retry(2, 1000)
                        ->post("{$this->otpServiceUrl}/send-otp", [
                            'phone' => $isPhone ? $identifier : $user->phone_number,
                            'email' => !$isPhone ? $identifier : $user->email,
                            'customMessage' => "Hello {$user->name},\n\nYour UET JKUAT login verification code is: {otp}\n\nValid for 5 minutes.\n\n_UET JKUAT Ministry Platform_"
                        ]);
                    
                    if ($response->successful()) {
                        break;
                    }
                } catch (\Exception $e) {
                    $lastException = $e;
                    \Log::warning("OTP attempt {$attempt} failed: " . $e->getMessage());
                    if ($attempt < $maxRetries) {
                        sleep(1);
                    }
                }
            }
            
            if (!$response) {
                throw $lastException ?? new \Exception('All OTP attempts failed');
            }

            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'success' => true,
                    'message' => 'OTP sent successfully via WhatsApp',
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phoneNumber' => $user->phone_number
                    ],
                    'otpSent' => true,
                    'expiresIn' => '5 minutes',
                    'provider' => $data['provider'] ?? 'WhatsApp'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send OTP. Please try again.',
                    'error' => 'OTP_SERVICE_ERROR'
                ], 500);
            }
        } catch (\Exception $e) {
            \Log::error('OTP Service Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'OTP service temporarily unavailable. Please use password login.',
                'error' => 'OTP_SERVICE_UNAVAILABLE'
            ], 503);
        }
    }

    /**
     * Verify OTP and login user
     */
    public function verifyOTPAndLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $identifier = $request->identifier;
        $otp = $request->otp;

        // Find user
        $user = User::where('email', $identifier)
            ->orWhere('phone_number', $identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'error' => 'USER_NOT_FOUND'
            ], 404);
        }

        $isPhone = preg_match('/^[0-9+]+$/', $identifier);

        try {
            // Verify OTP with WhatsApp service
            $response = Http::timeout(10)->post("{$this->otpServiceUrl}/verify-otp", [
                'phone' => $isPhone ? $identifier : $user->phone_number,
                'email' => !$isPhone ? $identifier : $user->email,
                'otp' => $otp
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if ($data['success']) {
                    // OTP verified successfully - log user in
                    // Create session token (you can use Laravel Sanctum or custom token)
                    $token = bin2hex(random_bytes(32));
                    
                    // Store token in user session or database
                    // For now, we'll just return user data
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Login successful',
                        'user' => [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            // Provide both camelCase and snake_case for frontend compatibility
                            'phoneNumber' => $user->phone_number,
                            'phone_number' => $user->phone_number,
                            'role' => $user->role,
                            'avatar' => $user->avatar,
                            'status' => $user->status,
                            'yearOfStudy' => $user->year_of_study,
                            'course' => $user->course,
                            'college' => $user->college,
                            'admissionNumber' => $user->admission_number
                        ],
                        'token' => $token,
                        'loginMethod' => 'otp'
                    ]);
                }
            }

            // OTP verification failed
            $errorData = $response->json();
            
            return response()->json([
                'success' => false,
                'message' => $errorData['message'] ?? 'Invalid OTP',
                'error' => $errorData['error'] ?? 'INVALID_OTP',
                'attemptsRemaining' => $errorData['attemptsRemaining'] ?? 0
            ], 400);

        } catch (\Exception $e) {
            \Log::error('OTP Verification Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'OTP verification failed. Please try again.',
                'error' => 'VERIFICATION_ERROR'
            ], 500);
        }
    }

    /**
     * Check OTP service status
     */
    public function checkOTPServiceStatus()
    {
        try {
            $response = Http::timeout(5)->get("{$this->otpServiceUrl}/status");
            
            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'available' => true,
                    'data' => $response->json()
                ]);
            }
            
            return response()->json([
                'success' => false,
                'available' => false,
                'message' => 'OTP service not responding'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'available' => false,
                'message' => 'OTP service unavailable'
            ]);
        }
    }

    /**
     * Request OTP for registration (user doesn't exist yet)
     * This is for phone verification during registration
     */
    public function requestRegistrationOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'email' => 'required|email',
            'name' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $phone = $request->phone;
        $email = $request->email;
        $name = $request->name;

        // Check if email or phone already exists
        $existingUser = User::where('email', $email)
            ->orWhere('phone_number', $phone)
            ->first();

        if ($existingUser) {
            $field = $existingUser->email === $email ? 'email' : 'phone number';
            return response()->json([
                'success' => false,
                'message' => "This {$field} is already registered. Please login instead.",
                'error' => 'USER_EXISTS'
            ], 409);
        }

        try {
            // Call WhatsApp OTP service with retry logic
            $maxRetries = 3;
            $response = null;
            $lastException = null;
            
            for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
                try {
                    \Log::info("Registration OTP Request attempt {$attempt} to {$this->otpServiceUrl}/send-otp");
                    
                    $response = Http::timeout(30)
                        ->retry(2, 1000)
                        ->post("{$this->otpServiceUrl}/send-otp", [
                            'phone' => $phone,
                            'email' => $email,
                            'customMessage' => "Hello {$name},\n\nYour UET JKUAT registration verification code is: {otp}\n\nValid for 5 minutes.\n\n_Welcome to UET JKUAT Ministry Platform_"
                        ]);
                    
                    if ($response->successful()) {
                        break;
                    }
                } catch (\Exception $e) {
                    $lastException = $e;
                    \Log::warning("Registration OTP attempt {$attempt} failed: " . $e->getMessage());
                    if ($attempt < $maxRetries) {
                        sleep(1);
                    }
                }
            }
            
            if (!$response) {
                throw $lastException ?? new \Exception('All OTP attempts failed');
            }

            if ($response->successful()) {
                $data = $response->json();
                
                return response()->json([
                    'success' => true,
                    'message' => 'Verification code sent successfully via WhatsApp',
                    'otpSent' => true,
                    'expiresIn' => '5 minutes',
                    'provider' => $data['provider'] ?? 'WhatsApp'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to send verification code. Please try again.',
                    'error' => 'OTP_SERVICE_ERROR'
                ], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Registration OTP Service Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Verification service temporarily unavailable. Please try again later.',
                'error' => 'OTP_SERVICE_UNAVAILABLE'
            ], 503);
        }
    }

    /**
     * Verify OTP for registration and create user
     */
    public function verifyRegistrationOTP(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'name' => 'required|string|max:255',
            'password' => 'required|string|min:6',
            'phoneNumber' => 'nullable|string|max:20',
            'yearOfStudy' => 'nullable|string|max:50',
            'course' => 'nullable|string|max:255',
            'college' => 'nullable|string|max:255',
            'admissionNumber' => 'nullable|string|max:50',
            'ministryInterest' => 'nullable|string|max:255',
            'residence' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        try {
            // Verify OTP with the OTP service
            $verifyResponse = Http::timeout(10)->post("{$this->otpServiceUrl}/verify-otp", [
                'phone' => $request->phone,
                'otp' => $request->otp
            ]);

            if ($verifyResponse->successful()) {
                $verifyData = $verifyResponse->json();
                
                if ($verifyData['success'] ?? false) {
                    // OTP is valid - create the user
                    $memberId = \App\Services\MemberIdService::generate();
                    $token = \Illuminate\Support\Str::random(60);
                    
                    // Determine role
                    $role = ($request->email === 'admin@uetjkuat.com') ? 'admin' : 'user';
                    
                    $user = User::create([
                        'name' => $request->name,
                        'email' => $request->email,
                        'password' => Hash::make($request->password),
                        'member_id' => $memberId,
                        'phone_number' => $request->phone,
                        'year_of_study' => $request->yearOfStudy,
                        'course' => $request->course,
                        'college' => $request->college,
                        'admission_number' => $request->admissionNumber,
                        'ministry_interest' => $request->ministryInterest,
                        'residence' => $request->residence,
                        'role' => $role,
                        'status' => 'active',
                        'phone_verified_at' => now(),
                        'registration_completed_at' => now(),
                        'remember_token' => $token,
                    ]);
                    
                    \Log::info('User registered via OTP', [
                        'user_id' => $user->id,
                        'member_id' => $memberId,
                        'email' => $user->email,
                    ]);
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Registration successful! Welcome to UET JKUAT.',
                        'data' => [
                            'user' => $user->getProfileData(),
                            'token' => $token,
                        ]
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid or expired verification code. Please try again.',
                        'error' => 'INVALID_OTP'
                    ], 400);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to verify code. Please try again.',
                    'error' => 'VERIFICATION_FAILED'
                ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Registration OTP Verification Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Verification service error. Please try again.',
                'error' => 'SERVICE_ERROR'
            ], 500);
        }
    }

    /**
     * Reset password using OTP verification
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
            'newPassword' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 400);
        }

        $identifier = $request->identifier;

        // Find user by email or phone
        $user = User::where('email', $identifier)
            ->orWhere('phone_number', $identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
                'error' => 'USER_NOT_FOUND'
            ], 404);
        }

        try {
            // Verify OTP with the OTP service
            $verifyResponse = Http::timeout(30)->post("{$this->otpServiceUrl}/verify-otp", [
                'phone' => $user->phone_number,
                'otp' => $request->otp
            ]);

            if ($verifyResponse->successful()) {
                $verifyData = $verifyResponse->json();
                
                if ($verifyData['success'] ?? false) {
                    // OTP is valid - update password
                    $user->password = Hash::make($request->newPassword);
                    $user->save();
                    
                    \Log::info('Password reset via OTP', [
                        'user_id' => $user->id,
                        'email' => $user->email,
                    ]);
                    
                    return response()->json([
                        'success' => true,
                        'message' => 'Password reset successful! You can now login with your new password.'
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid or expired verification code.',
                        'error' => 'INVALID_OTP'
                    ], 400);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to verify code. Please try again.',
                    'error' => 'VERIFICATION_FAILED'
                ], 400);
            }
        } catch (\Exception $e) {
            \Log::error('Password Reset Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Password reset failed. Please try again.',
                'error' => 'SERVICE_ERROR'
            ], 500);
        }
    }
}
