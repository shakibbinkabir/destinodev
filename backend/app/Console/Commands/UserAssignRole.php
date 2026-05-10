<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

/**
 * Assign a Spatie Permission role to a user by email.
 *
 * Exists because tinker is unusable on Hostinger and similar shared hosts —
 * Psy Shell calls shell_exec() at startup and shell_exec/exec are in PHP's
 * disable_functions list there. Without this command, granting a role to a
 * freshly-created Filament user requires direct SQL or a one-off seeder.
 *
 * Usage:
 *   php artisan user:assign-role admin@example.com super_admin
 *
 * Idempotent — re-running with the same args is a no-op (Spatie's assignRole
 * dedupes against existing model_has_roles rows).
 */
class UserAssignRole extends Command
{
    protected $signature = 'user:assign-role {email} {role}';

    protected $description = 'Assign a Spatie role (e.g. super_admin) to a user, by email.';

    public function handle(): int
    {
        $email = $this->argument('email');
        $role = $this->argument('role');

        $user = User::where('email', $email)->first();
        if (!$user) {
            $this->error("No user with email {$email}.");
            return self::FAILURE;
        }

        if (!Role::where('name', $role)->where('guard_name', 'web')->exists()) {
            $this->error("Role '{$role}' does not exist on the web guard. Run db:seed first (RolesAndAdminSeeder creates super_admin and editor).");
            return self::FAILURE;
        }

        $user->assignRole($role);

        $this->info("Assigned '{$role}' to {$email}.");
        return self::SUCCESS;
    }
}
