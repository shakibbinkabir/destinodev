<?php

namespace App\Policies;

use App\Models\User;
use App\Models\HeroSlide;
use Illuminate\Auth\Access\HandlesAuthorization;

class HeroSlidePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('view_any_hero::slide');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, HeroSlide $heroSlide): bool
    {
        return $user->can('view_hero::slide');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('create_hero::slide');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, HeroSlide $heroSlide): bool
    {
        return $user->can('update_hero::slide');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, HeroSlide $heroSlide): bool
    {
        return $user->can('delete_hero::slide');
    }

    /**
     * Determine whether the user can bulk delete.
     */
    public function deleteAny(User $user): bool
    {
        return $user->can('delete_any_hero::slide');
    }

    /**
     * Determine whether the user can permanently delete.
     */
    public function forceDelete(User $user, HeroSlide $heroSlide): bool
    {
        return $user->can('force_delete_hero::slide');
    }

    /**
     * Determine whether the user can permanently bulk delete.
     */
    public function forceDeleteAny(User $user): bool
    {
        return $user->can('force_delete_any_hero::slide');
    }

    /**
     * Determine whether the user can restore.
     */
    public function restore(User $user, HeroSlide $heroSlide): bool
    {
        return $user->can('restore_hero::slide');
    }

    /**
     * Determine whether the user can bulk restore.
     */
    public function restoreAny(User $user): bool
    {
        return $user->can('restore_any_hero::slide');
    }

    /**
     * Determine whether the user can replicate.
     */
    public function replicate(User $user, HeroSlide $heroSlide): bool
    {
        return $user->can('replicate_hero::slide');
    }

    /**
     * Determine whether the user can reorder.
     */
    public function reorder(User $user): bool
    {
        return $user->can('reorder_hero::slide');
    }
}
