<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
    ];

    protected $casts = [
        'value' => 'array',
    ];

    /**
     * Get a setting value by key
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }

        return $setting->value;
    }

    /**
     * Set a setting value by key
     */
    public static function setValue(string $key, $value, string $type = 'string'): self
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => $type]
        );
    }

    /**
     * Get all system settings as a formatted array
     */
    public static function getAllSettings(): array
    {
        $settings = self::all()->pluck('value', 'key')->toArray();
        
        return [
            'chair_name' => $settings['chair_name'] ?? '',
            'chair_title' => $settings['chair_title'] ?? 'Chairperson',
            'chair_image' => $settings['chair_image'] ?? null,
            'organization_name' => $settings['organization_name'] ?? 'UET JKUAT',
            'organization_tagline' => $settings['organization_tagline'] ?? 'Empowering Students Through Technology',
            'visible_modules' => $settings['visible_modules'] ?? [
                'news' => true,
                'announcements' => true,
                'merchandise' => true,
                'projects' => true,
                'finance' => true,
                'tickets' => true,
            ],
        ];
    }

    /**
     * Save all system settings from an array
     */
    public static function saveAllSettings(array $data): void
    {
        $settingsToSave = [
            'chair_name' => $data['chair_name'] ?? '',
            'chair_title' => $data['chair_title'] ?? 'Chairperson',
            'chair_image' => $data['chair_image'] ?? null,
            'organization_name' => $data['organization_name'] ?? 'UET JKUAT',
            'organization_tagline' => $data['organization_tagline'] ?? 'Empowering Students Through Technology',
            'visible_modules' => $data['visible_modules'] ?? null,
        ];

        foreach ($settingsToSave as $key => $value) {
            if ($value !== null) {
                $type = is_array($value) ? 'json' : 'string';
                self::setValue($key, $value, $type);
            }
        }
    }
}
