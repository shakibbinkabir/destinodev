<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 180);
            $table->string('phone', 40)->nullable();
            $table->string('country', 80)->nullable();
            $table->text('message');
            $table->foreignId('car_id')->nullable()->constrained('cars')->nullOnDelete();
            $table->string('car_reference', 120)->nullable();
            $table->enum('source', ['contact_page', 'single_car', 'homepage', 'footer', 'other']);
            $table->enum('status', ['new', 'in_progress', 'replied', 'closed', 'spam'])->default('new')->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};
