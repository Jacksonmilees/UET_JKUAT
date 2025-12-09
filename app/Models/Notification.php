<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'action_url',
        'data',
        'read',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Notification types
    const TYPE_PAYMENT = 'payment';
    const TYPE_WITHDRAWAL = 'withdrawal';
    const TYPE_ANNOUNCEMENT = 'announcement';
    const TYPE_MILESTONE = 'milestone';
    const TYPE_SYSTEM = 'system';
    const TYPE_TICKET = 'ticket';
    const TYPE_PROJECT = 'project';

    /**
     * Get the user this notification belongs to
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(): void
    {
        if (!$this->read) {
            $this->update([
                'read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Create a payment notification
     */
    public static function createPaymentNotification(
        int $userId, 
        string $title, 
        string $message, 
        array $data = []
    ): self {
        return self::create([
            'user_id' => $userId,
            'type' => self::TYPE_PAYMENT,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Create a system announcement
     */
    public static function createAnnouncement(
        int $userId,
        string $title,
        string $message,
        ?string $actionUrl = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'type' => self::TYPE_ANNOUNCEMENT,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
        ]);
    }

    /**
     * Create milestone notification
     */
    public static function createMilestoneNotification(
        int $userId,
        string $title,
        string $message,
        array $data = []
    ): self {
        return self::create([
            'user_id' => $userId,
            'type' => self::TYPE_MILESTONE,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    /**
     * Get unread count for a user
     */
    public static function getUnreadCount(int $userId): int
    {
        return self::where('user_id', $userId)
            ->where('read', false)
            ->count();
    }

    /**
     * Get recent notifications for a user
     */
    public static function getRecent(int $userId, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Mark all as read for a user
     */
    public static function markAllAsRead(int $userId): int
    {
        return self::where('user_id', $userId)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Broadcast to all users
     */
    public static function broadcastToAll(string $title, string $message, ?string $actionUrl = null): int
    {
        $users = User::where('is_active', true)->pluck('id');
        $count = 0;
        
        foreach ($users as $userId) {
            self::createAnnouncement($userId, $title, $message, $actionUrl);
            $count++;
        }
        
        return $count;
    }
}
