<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Get all orders for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $userId = $request->user()->id ?? null;
            
            $orders = Order::when($userId, function ($query) use ($userId) {
                    return $query->where('user_id', $userId);
                })
                ->with(['items', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all orders (admin)
     */
    public function getAllOrders(Request $request)
    {
        try {
            $status = $request->query('status');
            
            $orders = Order::with(['items', 'user'])
                ->when($status, function ($query) use ($status) {
                    return $query->where('status', $status);
                })
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new order
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array',
                'items.*.merchandise_id' => 'required|integer',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'delivery_address' => 'required|string',
                'phone_number' => 'required|string',
            ]);

            DB::beginTransaction();

            // Calculate total
            $totalAmount = collect($validated['items'])->sum(function ($item) {
                return $item['price'] * $item['quantity'];
            });

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id ?? null,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'total_amount' => $totalAmount,
                'status' => 'pending',
                'payment_status' => 'pending',
                'delivery_address' => $validated['delivery_address'],
                'phone_number' => $validated['phone_number'],
            ]);

            // Create order items
            foreach ($validated['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'merchandise_id' => $item['merchandise_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => $order->load('items'),
                'message' => 'Order created successfully'
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get a single order
     */
    public function show($id)
    {
        try {
            $order = Order::with(['items', 'user'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Order not found'
            ], 404);
        }
    }

    /**
     * Update order status (admin only)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
                'tracking_number' => 'nullable|string',
            ]);

            $order = Order::findOrFail($id);
            $order->update($validated);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Order status updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:pending,paid,failed',
            ]);

            $order = Order::findOrFail($id);
            $order->update($validated);

            return response()->json([
                'success' => true,
                'data' => $order,
                'message' => 'Payment status updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to update payment status: ' . $e->getMessage()
            ], 500);
        }
    }
}
