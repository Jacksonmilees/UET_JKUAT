<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Get all categories
     */
    public function index(Request $request)
    {
        try {
            $query = Category::query();
            
            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }
            
            // Filter by active status
            if ($request->has('active')) {
                if ($request->active !== 'all') {
                    $query->where('active', $request->boolean('active'));
                }
            } else {
                $query->where('active', true);
            }
            
            $categories = $query->orderBy('name', 'asc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $categories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No categories available'
            ]);
        }
    }

    /**
     * Get a single category
     */
    public function show($id)
    {
        try {
            $category = Category::with('merchandise')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $category
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Category not found'
            ], 404);
        }
    }

    /**
     * Create a new category (admin only)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|string|in:merchandise,project,news,general',
                'active' => 'boolean',
            ]);

            // Generate slug from name
            $validated['slug'] = Str::slug($validated['name']);
            
            // Ensure unique slug
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Category::where('slug', $validated['slug'])->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count++;
            }

            $category = Category::create($validated);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category created successfully'
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a category (admin only)
     */
    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'type' => 'sometimes|string|in:merchandise,project,news,general',
                'active' => 'sometimes|boolean',
            ]);

            // Update slug if name changed
            if (isset($validated['name']) && $validated['name'] !== $category->name) {
                $validated['slug'] = Str::slug($validated['name']);
                $originalSlug = $validated['slug'];
                $count = 1;
                while (Category::where('slug', $validated['slug'])->where('id', '!=', $id)->exists()) {
                    $validated['slug'] = $originalSlug . '-' . $count++;
                }
            }

            $category->update($validated);

            return response()->json([
                'success' => true,
                'data' => $category,
                'message' => 'Category updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to update category: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a category (admin only)
     */
    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            $category->delete();

            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete category: ' . $e->getMessage()
            ], 500);
        }
    }
}
