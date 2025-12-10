<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'member_id',
        'phone_number',
        'year_of_study',
        'course',
        'college',
        'admission_number',
        'ministry_interest',
        'residence',
        'role',
        'status',
        'avatar',
        'registration_completed_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'registration_completed_at' => 'datetime',
        ];
    }

    /**
     * Relationships
     */
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    /**
     * Get user's full profile data
     *
     * @return array
     */
    public function getProfileData(): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone_number' => $this->phone_number,
            'year_of_study' => $this->year_of_study,
            'course' => $this->course,
            'college' => $this->college,
            'admission_number' => $this->admission_number,
            'ministry_interest' => $this->ministry_interest,
            'residence' => $this->residence,
            'role' => $this->role ?? 'user',
            'roles' => $this->roles->pluck('name')->toArray(),
            'permissions' => $this->getAllPermissions(),
            'status' => $this->status ?? 'active',
            'avatar' => $this->avatar,
            'registration_completed_at' => $this->registration_completed_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    /**
     * Check if user is admin (maintains backward compatibility)
     * Now checks both old role field and new RBAC system
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        // Check new RBAC system first
        if ($this->hasAnyRole(['super-admin', 'admin', 'treasurer', 'project-manager'])) {
            return true;
        }
        // Fall back to old system for backward compatibility
        return in_array($this->role, ['admin', 'super_admin']) || $this->email === 'admin@uetjkuat.com';
    }

    /**
     * Check if user is active
     *
     * @return bool
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
