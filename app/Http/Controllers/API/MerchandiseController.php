<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Merchandise;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
            // Return empty array instead of 500 error if table doesn't exist
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No merchandise available'
            ]);
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

    /**
     * Purchase merchandise with wallet balance
     */
    public function purchaseWithWallet(Request $request, $id)
    {
        $user = Auth::user();

        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
                'delivery_address' => 'nullable|string|max:500',
                'phone' => 'nullable|string|max:20',
            ]);

            $merchandise = Merchandise::findOrFail($id);

            // Check if merchandise is active
            if (!$merchandise->active) {
                return response()->json([
                    'success' => false,
                    'message' => 'This merchandise is no longer available',
                ], 400);
            }

            // Check stock availability
            if ($merchandise->stock < $validated['quantity']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient stock available',
                    'data' => [
                        'requested' => $validated['quantity'],
                        'available' => $merchandise->stock,
                    ],
                ], 400);
            }

            $totalAmount = $merchandise->price * $validated['quantity'];

            // Check wallet balance
            if (!$user->hasSufficientBalance($totalAmount)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Insufficient wallet balance',
                    'data' => [
                        'balance' => $user->balance,
                        'required' => $totalAmount,
                        'shortfall' => $totalAmount - $user->balance,
                    ],
                ], 400);
            }

            DB::beginTransaction();

            try {
                // Deduct from wallet
                $success = $user->deductFromWallet($totalAmount, 'merchandise', [
                    'merchandise_id' => $merchandise->id,
                    'merchandise_name' => $merchandise->name,
                    'quantity' => $validated['quantity'],
                    'unit_price' => $merchandise->price,
                    'total_amount' => $totalAmount,
                    'delivery_address' => $validated['delivery_address'] ?? null,
                    'phone' => $validated['phone'] ?? $user->phone_number,
                ]);

                if (!$success) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to process payment',
                    ], 500);
                }

                // Update merchandise stock
                $merchandise->decrement('stock', $validated['quantity']);

                DB::commit();

                Log::info('Merchandise purchased with wallet', [
                    'user_id' => $user->id,
                    'merchandise_id' => $merchandise->id,
                    'quantity' => $validated['quantity'],
                    'amount' => $totalAmount,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Purchase successful',
                    'data' => [
                        'merchandise' => $merchandise->name,
                        'quantity' => $validated['quantity'],
                        'total_amount' => $totalAmount,
                        'new_balance' => $user->fresh()->balance,
                    ],
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error purchasing merchandise with wallet', [
                'user_id' => $user->id ?? null,
                'merchandise_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing purchase',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}
