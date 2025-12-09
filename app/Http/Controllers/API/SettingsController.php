<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class SettingsController extends Controller
{
    /**
     * Get all system settings
     */
    public function index()
    {
        try {
            $settings = Setting::getAllSettings();
            
            return response()->json([
                'success' => true,
                'data' => $settings,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching settings: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch settings',
            ], 500);
        }
    }

    /**
     * Get public settings (visible modules only - for regular users)
     */
    public function publicSettings()
    {
        try {
            $settings = Setting::getAllSettings();
            
            return response()->json([
                'success' => true,
                'data' => [
                    'chair_name' => $settings['chair_name'],
                    'chair_title' => $settings['chair_title'],
                    'chair_image' => $settings['chair_image'],
                    'organization_name' => $settings['organization_name'],
                    'organization_tagline' => $settings['organization_tagline'],
                    'visible_modules' => $settings['visible_modules'],
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching public settings: ' . $e->getMessage());
            
            return response()->json([
                'success' => true,
                'data' => [
                    'chair_name' => '',
                    'chair_title' => 'Chairperson',
                    'chair_image' => null,
                    'organization_name' => 'UET JKUAT',
                    'organization_tagline' => 'Empowering Students Through Technology',
                    'visible_modules' => [
                        'news' => true,
                        'announcements' => true,
                        'merchandise' => true,
                        'projects' => true,
                        'finance' => true,
                        'tickets' => true,
                    ],
                ],
            ]);
        }
    }

    /**
     * Update system settings
     */
    public function update(Request $request)
    {
        try {
            $data = $request->validate([
                'chair_name' => 'nullable|string|max:255',
                'chair_title' => 'nullable|string|max:255',
                'chair_image' => 'nullable|string',
                'organization_name' => 'nullable|string|max:255',
                'organization_tagline' => 'nullable|string|max:500',
                'visible_modules' => 'nullable|array',
                'visible_modules.news' => 'nullable|boolean',
                'visible_modules.announcements' => 'nullable|boolean',
                'visible_modules.merchandise' => 'nullable|boolean',
                'visible_modules.projects' => 'nullable|boolean',
                'visible_modules.finance' => 'nullable|boolean',
                'visible_modules.tickets' => 'nullable|boolean',
            ]);

            Setting::saveAllSettings($data);

            return response()->json([
                'success' => true,
                'message' => 'Settings updated successfully',
                'data' => Setting::getAllSettings(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error updating settings: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to update settings',
            ], 500);
        }
    }

    /**
     * Upload chair image
     */
    public function uploadChairImage(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            ]);

            $file = $request->file('file');
            $filename = 'chair_' . time() . '.' . $file->getClientOriginalExtension();
            
            // Store in public storage
            $path = $file->storeAs('uploads/settings', $filename, 'public');
            
            $url = Storage::disk('public')->url($path);
            
            // Update the chair_image setting
            Setting::setValue('chair_image', $url, 'string');

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'url' => $url,
                    'path' => $path,
                ],
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'error' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error uploading chair image: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to upload image: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove chair image
     */
    public function removeChairImage()
    {
        try {
            $currentImage = Setting::getValue('chair_image');
            
            if ($currentImage) {
                // Try to delete the file from storage
                $path = str_replace(Storage::disk('public')->url(''), '', $currentImage);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }
            
            // Clear the setting
            Setting::setValue('chair_image', null, 'string');

            return response()->json([
                'success' => true,
                'message' => 'Chair image removed successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing chair image: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to remove image',
            ], 500);
        }
    }
}
