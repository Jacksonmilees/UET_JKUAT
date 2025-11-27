<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        try {
            $path = $request->file('file')->store('uploads', 'public');
            $url = Storage::disk('public')->url($path);

            return response()->json([
                'success' => true,
                'data' => [
                    'url' => $url,
                    'path' => $path,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Upload failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Upload failed',
            ], 500);
        }
    }
}


