<?php

namespace App\Http\Controllers;

use App\Models\Campaign;
use App\Services\CampaignService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CampaignController extends Controller
{
    protected $campaignService;

    public function __construct(CampaignService $campaignService)
    {
        $this->campaignService = $campaignService;
    }

    /**
     * Get all campaigns for authenticated user
     */
    public function index(Request $request)
    {
        try {
            $campaigns = $this->campaignService->getUserCampaigns($request->user()->id);

            return response()->json([
                'success' => true,
                'campaigns' => $campaigns,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch campaigns',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new campaign
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'nullable|numeric|min:0',
            'project_id' => 'nullable|exists:projects,id',
            'campaign_type' => 'required|in:project,ticket,general',
            'end_date' => 'nullable|date|after:today',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Check if user has permission to create campaigns
            if (!$request->user()->hasPermission('create-campaigns')) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to create campaigns',
                ], 403);
            }

            $campaign = $this->campaignService->createCampaign(
                $request->all(),
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Campaign created successfully',
                'campaign' => $campaign->load('project'),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create campaign',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get specific campaign details
     */
    public function show(Request $request, Campaign $campaign)
    {
        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'campaign' => $campaign->load(['project', 'user']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch campaign',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update campaign
     */
    public function update(Request $request, Campaign $campaign)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:active,paused,completed,archived',
            'end_date' => 'nullable|date',
            'settings' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $updatedCampaign = $this->campaignService->updateCampaign($campaign, $request->all());

            return response()->json([
                'success' => true,
                'message' => 'Campaign updated successfully',
                'campaign' => $updatedCampaign,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update campaign',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Toggle campaign status (active/paused)
     */
    public function toggleStatus(Request $request, Campaign $campaign)
    {
        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $updatedCampaign = $this->campaignService->toggleCampaignStatus($campaign);

            return response()->json([
                'success' => true,
                'message' => 'Campaign status updated',
                'campaign' => $updatedCampaign,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update campaign status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete campaign
     */
    public function destroy(Request $request, Campaign $campaign)
    {
        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            // Soft delete
            $campaign->delete();

            return response()->json([
                'success' => true,
                'message' => 'Campaign deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete campaign',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get campaign analytics
     */
    public function analytics(Request $request, Campaign $campaign)
    {
        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $analytics = $this->campaignService->getCampaignAnalytics($campaign);
            $performance = $this->campaignService->getPerformanceMetrics($campaign);

            return response()->json([
                'success' => true,
                'analytics' => $analytics,
                'performance' => $performance,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get shareable content for campaign
     */
    public function shareable(Request $request, Campaign $campaign)
    {
        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $shareableContent = $this->campaignService->getShareableContent($campaign);

            return response()->json([
                'success' => true,
                'shareable' => $shareableContent,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate shareable content',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get campaign donations
     */
    public function donations(Request $request, Campaign $campaign)
    {
        try {
            // Verify ownership
            if ($campaign->user_id !== $request->user()->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access',
                ], 403);
            }

            $donations = $campaign->donations()
                ->with('transaction')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'donations' => $donations,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch donations',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Track share event
     */
    public function trackShare(Request $request, Campaign $campaign)
    {
        $validator = Validator::make($request->all(), [
            'source' => 'required|in:facebook,twitter,whatsapp,instagram,linkedin,email,copy',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid source',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $this->campaignService->trackShare($campaign, $request->source);

            return response()->json([
                'success' => true,
                'message' => 'Share tracked successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to track share',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
