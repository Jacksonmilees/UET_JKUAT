<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phoneNumber' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $token = Str::random(60);

        $user = User::create([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'password' => Hash::make($request->get('password')),
            'remember_token' => $token,
        ]);

        // Optional fields
        if ($request->get('phoneNumber')) {
            $user->phone_number = $request->get('phoneNumber');
        }
        if ($request->get('status')) {
            $user->status = $request->get('status');
        }
        $user->save();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ($user->email === 'admin@uetjkuat.com') ? 'admin' : ($user->role ?? 'user'),
                    'status' => $user->status ?? 'active',
                    'phone_number' => $user->phone_number ?? null,
                ],
                'token' => $token,
            ],
        ]);
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
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => ($user->email === 'admin@uetjkuat.com') ? 'admin' : ($user->role ?? 'user'),
                    'status' => $user->status ?? 'active',
                    'phone_number' => $user->phone_number ?? null,
                ],
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
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ($user->email === 'admin@uetjkuat.com') ? 'admin' : ($user->role ?? 'user'),
                'status' => $user->status ?? 'active',
                'phone_number' => $user->phone_number ?? null,
            ]
        ]);
    }
}


