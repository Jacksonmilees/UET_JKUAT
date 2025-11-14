<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        // Basic placeholder implementation: return an empty list for now
        Log::info('News index endpoint hit');

        return response()->json([
            'data' => [],
            'message' => 'News endpoint is available',
        ]);
    }

    public function show($id)
    {
        // Basic placeholder implementation
        return response()->json([
            'data' => null,
            'message' => 'News article not found',
        ], 404);
    }
}
