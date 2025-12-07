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
            // Call WhatsApp OTP service
            $response = Http::timeout(10)->post("{$this->otpServiceUrl}/send-otp", [
                'phone' => $isPhone ? $identifier : $user->phone_number,
                'email' => !$isPhone ? $identifier : $user->email,
                'customMessage' => "Hello {$user->name},\n\nYour UET JKUAT login verification code is: {otp}\n\nValid for 5 minutes.\n\n_UET JKUAT Ministry Platform_"
            ]);

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
}
