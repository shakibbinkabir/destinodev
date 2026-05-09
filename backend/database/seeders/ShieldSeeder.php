<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use BezhanSalleh\FilamentShield\Support\Utils;
use Spatie\Permission\PermissionRegistrar;

class ShieldSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $rolesWithPermissions = '[{"name":"super_admin","guard_name":"web","permissions":["view_car","view_any_car","create_car","update_car","restore_car","restore_any_car","replicate_car","reorder_car","delete_car","delete_any_car","force_delete_car","force_delete_any_car","view_delivered::car","view_any_delivered::car","create_delivered::car","update_delivered::car","restore_delivered::car","restore_any_delivered::car","replicate_delivered::car","reorder_delivered::car","delete_delivered::car","delete_any_delivered::car","force_delete_delivered::car","force_delete_any_delivered::car","view_hero::slide","view_any_hero::slide","create_hero::slide","update_hero::slide","restore_hero::slide","restore_any_hero::slide","replicate_hero::slide","reorder_hero::slide","delete_hero::slide","delete_any_hero::slide","force_delete_hero::slide","force_delete_any_hero::slide","view_inquiry","view_any_inquiry","create_inquiry","update_inquiry","restore_inquiry","restore_any_inquiry","replicate_inquiry","reorder_inquiry","delete_inquiry","delete_any_inquiry","force_delete_inquiry","force_delete_any_inquiry","view_page::content","view_any_page::content","create_page::content","update_page::content","restore_page::content","restore_any_page::content","replicate_page::content","reorder_page::content","delete_page::content","delete_any_page::content","force_delete_page::content","force_delete_any_page::content","view_partner","view_any_partner","create_partner","update_partner","restore_partner","restore_any_partner","replicate_partner","reorder_partner","delete_partner","delete_any_partner","force_delete_partner","force_delete_any_partner","view_process::step","view_any_process::step","create_process::step","update_process::step","restore_process::step","restore_any_process::step","replicate_process::step","reorder_process::step","delete_process::step","delete_any_process::step","force_delete_process::step","force_delete_any_process::step","view_role","view_any_role","create_role","update_role","delete_role","delete_any_role","view_service","view_any_service","create_service","update_service","restore_service","restore_any_service","replicate_service","reorder_service","delete_service","delete_any_service","force_delete_service","force_delete_any_service","view_setting","view_any_setting","create_setting","update_setting","restore_setting","restore_any_setting","replicate_setting","reorder_setting","delete_setting","delete_any_setting","force_delete_setting","force_delete_any_setting","view_testimonial","view_any_testimonial","create_testimonial","update_testimonial","restore_testimonial","restore_any_testimonial","replicate_testimonial","reorder_testimonial","delete_testimonial","delete_any_testimonial","force_delete_testimonial","force_delete_any_testimonial"]}]';
        $directPermissions = '[]';

        static::makeRolesWithPermissions($rolesWithPermissions);
        static::makeDirectPermissions($directPermissions);

        $this->command->info('Shield Seeding Completed.');
    }

    protected static function makeRolesWithPermissions(string $rolesWithPermissions): void
    {
        if (! blank($rolePlusPermissions = json_decode($rolesWithPermissions, true))) {
            /** @var Model $roleModel */
            $roleModel = Utils::getRoleModel();
            /** @var Model $permissionModel */
            $permissionModel = Utils::getPermissionModel();

            foreach ($rolePlusPermissions as $rolePlusPermission) {
                $role = $roleModel::firstOrCreate([
                    'name' => $rolePlusPermission['name'],
                    'guard_name' => $rolePlusPermission['guard_name'],
                ]);

                if (! blank($rolePlusPermission['permissions'])) {
                    $permissionModels = collect($rolePlusPermission['permissions'])
                        ->map(fn ($permission) => $permissionModel::firstOrCreate([
                            'name' => $permission,
                            'guard_name' => $rolePlusPermission['guard_name'],
                        ]))
                        ->all();

                    $role->syncPermissions($permissionModels);
                }
            }
        }
    }

    public static function makeDirectPermissions(string $directPermissions): void
    {
        if (! blank($permissions = json_decode($directPermissions, true))) {
            /** @var Model $permissionModel */
            $permissionModel = Utils::getPermissionModel();

            foreach ($permissions as $permission) {
                if ($permissionModel::whereName($permission)->doesntExist()) {
                    $permissionModel::create([
                        'name' => $permission['name'],
                        'guard_name' => $permission['guard_name'],
                    ]);
                }
            }
        }
    }
}
