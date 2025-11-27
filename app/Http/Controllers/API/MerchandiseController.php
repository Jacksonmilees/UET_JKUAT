<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Merchandise;
use Illuminate\Http\Request;

class MerchandiseController extends Controller
{
    /**
     * Get all merchandise
     */
    public function index(Request $request)
    {
        try {
            $query = Merchandise::query();
            
            // Filter by active status
            if ($request->has('active')) {
                $query->where('active', $request->boolean('active'));
            } else {
                $query->where('active', true); // Default to active only
            }
            
            // Filter by category
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            
            $merchandise = $query->orderBy('created_at', 'desc')->get();
            
            return response()->json([
                'success' => true,
                'data' => $merchandise
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch merchandise: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single merchandise item
     */
    public function show($id)
    {
        try {
            $merchandise = Merchandise::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $merchandise
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Merchandise not found'
            ], 404);
        }
    }

    /**
     * Create new merchandise (admin only)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'stock' => 'required|integer|min:0',
                'category' => 'nullable|string',
                'image_url' => 'nullable|string',
                'active' => 'boolean',
            ]);

            $merchandise = Merchandise::create($validated);

            return response()->json([
                'success' => true,
                'data' => $merchandise,
                'message' => 'Merchandise created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to create merchandise: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update merchandise (admin only)
     */
    public function update(Request $request, $id)
    {
        try {
            $merchandise = Merchandise::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:0',
                'stock' => 'sometimes|integer|min:0',
                'category' => 'nullable|string',
                'image_url' => 'nullable|string',
                'active' => 'sometimes|boolean',
            ]);

            $merchandise->update($validated);

            return response()->json([
                'success' => true,
                'data' => $merchandise,
                'message' => 'Merchandise updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update merchandise: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete merchandise (admin only)
     */
    public function destroy($id)
    {
        try {
            $merchandise = Merchandise::findOrFail($id);
            $merchandise->delete();

            return response()->json([
                'success' => true,
                'message' => 'Merchandise deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete merchandise: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock
     */
    public function updateStock(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'stock' => 'required|integer|min:0',
            ]);

            $merchandise = Merchandise::findOrFail($id);
            $merchandise->update(['stock' => $validated['stock']]);

            return response()->json([
                'success' => true,
                'data' => $merchandise,
                'message' => 'Stock updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update stock: ' . $e->getMessage()
            ], 500);
        }
    }
}
