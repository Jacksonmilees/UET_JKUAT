<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NewsController extends Controller
{
    /**
     * Get all news articles
     */
    public function index(Request $request)
    {
        try {
            $query = News::query();

            // Support 'all' parameter for admin to see all items
            if ($request->has('all') && $request->boolean('all')) {
                // No filter - return all news items
            } elseif ($request->has('published')) {
                // Filter by specific published status
                $query->where('published', $request->boolean('published'));
            } else {
                // Default to published only for public users
                $query->where('published', true);
            }

            $news = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $news
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching news: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch news',
                'data' => []
            ], 500);
        }
    }

    /**
     * Get a single news article
     */
    public function show($id)
    {
        try {
            $news = News::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $news
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'News article not found',
                'data' => null
            ], 404);
        }
    }

    /**
     * Create a new news article (admin only)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'excerpt' => 'nullable|string',
                'image_url' => 'nullable|string',
                'author' => 'nullable|string',
                'published' => 'boolean',
            ]);

            $news = News::create($validated);

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'News article created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating news: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create news article'
            ], 500);
        }
    }

    /**
     * Update a news article (admin only)
     */
    public function update(Request $request, $id)
    {
        try {
            $news = News::findOrFail($id);

            $validated = $request->validate([
                'title' => 'sometimes|string|max:255',
                'content' => 'sometimes|string',
                'excerpt' => 'nullable|string',
                'image_url' => 'nullable|string',
                'author' => 'nullable|string',
                'published' => 'sometimes|boolean',
            ]);

            $news->update($validated);

            return response()->json([
                'success' => true,
                'data' => $news,
                'message' => 'News article updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating news: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update news article'
            ], 500);
        }
    }

    /**
     * Delete a news article (admin only)
     */
    public function destroy($id)
    {
        try {
            $news = News::findOrFail($id);
            $news->delete();

            return response()->json([
                'success' => true,
                'message' => 'News article deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting news: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete news article'
            ], 500);
        }
    }
}
