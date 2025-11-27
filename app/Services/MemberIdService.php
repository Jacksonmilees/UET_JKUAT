<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;

class MemberIdService
{
    /**
     * Generate unique member ID in format: UETJ1234AK27
     * 
     * Format breakdown:
     * - UETJ: Prefix for UET JKUAT
     * - 1234: 4 random digits
     * - A: Year letter (A=2024/2025, B=2025/2026, etc.)
     * - K: Month letter (A=Jan, B=Feb, C=Mar, D=Apr, E=May, F=Jun, G=Jul, H=Aug, I=Sep, J=Oct, K=Nov, L=Dec)
     * - 27: Day of month (01-31)
     * 
     * @return string
     */
    public static function generate(): string
    {
        $maxAttempts = 100;
        $attempt = 0;

        do {
            $memberId = self::generateId();
            $attempt++;
            
            // Check if ID already exists
            $exists = User::where('member_id', $memberId)->exists();
            
            if (!$exists) {
                return $memberId;
            }
        } while ($attempt < $maxAttempts);

        // Fallback: append timestamp if we can't generate unique ID
        return self::generateId() . substr(time(), -3);
    }

    /**
     * Generate the member ID string
     * 
     * @return string
     */
    private static function generateId(): string
    {
        $now = Carbon::now();
        
        // Prefix
        $prefix = 'UETJ';
        
        // 4 random digits
        $randomDigits = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        
        // Year letter (A for first year 2024/2025, B for 2025/2026, etc.)
        // Starting from 2024 as year A
        $yearLetter = self::getYearLetter($now->year);
        
        // Month letter (A=Jan, B=Feb, ..., L=Dec)
        $monthLetter = chr(64 + $now->month); // 64 + 1 = 65 = 'A'
        
        // Day (01-31)
        $day = $now->format('d');
        
        return $prefix . $randomDigits . $yearLetter . $monthLetter . $day;
    }

    /**
     * Get year letter based on current year
     * 2024 = A, 2025 = B, 2026 = C, etc.
     * 
     * @param int $year
     * @return string
     */
    private static function getYearLetter(int $year): string
    {
        $baseYear = 2024; // First year of the system
        $yearDifference = $year - $baseYear;
        
        // A=0, B=1, C=2, etc.
        return chr(65 + $yearDifference);
    }

    /**
     * Parse member ID to get registration details
     * 
     * @param string $memberId
     * @return array|null
     */
    public static function parse(string $memberId): ?array
    {
        // Expected format: UETJ1234AK27
        if (!preg_match('/^UETJ(\d{4})([A-Z])([A-L])(\d{2})/', $memberId, $matches)) {
            return null;
        }

        $randomDigits = $matches[1];
        $yearLetter = $matches[2];
        $monthLetter = $matches[3];
        $day = $matches[4];

        // Convert letters back to numbers
        $year = 2024 + (ord($yearLetter) - 65);
        $month = ord($monthLetter) - 64;

        return [
            'member_id' => $memberId,
            'random_digits' => $randomDigits,
            'year' => $year,
            'month' => $month,
            'day' => (int)$day,
            'year_letter' => $yearLetter,
            'month_letter' => $monthLetter,
            'formatted_date' => sprintf('%04d-%02d-%02d', $year, $month, $day),
        ];
    }

    /**
     * Get human-readable registration info from member ID
     * 
     * @param string $memberId
     * @return string|null
     */
    public static function getReadableInfo(string $memberId): ?string
    {
        $parsed = self::parse($memberId);
        
        if (!$parsed) {
            return null;
        }

        $monthNames = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'
        ];

        $monthName = $monthNames[$parsed['month']] ?? 'Unknown';
        
        return sprintf(
            'Registered: %s %d, %d (Year %s, Member #%s)',
            $monthName,
            $parsed['day'],
            $parsed['year'],
            $parsed['year_letter'],
            $parsed['random_digits']
        );
    }
}
