<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cars', function (Blueprint $table) {
            $table->id();
            $table->string('external_id', 100)->nullable()->unique();
            $table->string('make', 60)->index();
            $table->string('model', 120)->index();
            $table->unsignedSmallInteger('year')->index();
            $table->decimal('price_jpy', 12, 2);
            $table->unsignedInteger('mileage_km');
            $table->enum('fuel', ['gasoline', 'hybrid', 'ev', 'diesel'])->index();
            $table->enum('transmission', ['automatic', 'manual', 'cvt']);
            $table->string('body_type', 60)->index();
            $table->string('engine_size', 20)->nullable();
            $table->string('color', 40);
            $table->enum('drive_type', ['2wd', '4wd', 'awd', 'fwd', 'rwd']);
            $table->unsignedTinyInteger('seats');
            $table->unsignedTinyInteger('doors');
            $table->string('condition', 40);
            $table->enum('source', ['inhouse', 'api'])->index();
            $table->boolean('featured')->default(false)->index();
            $table->string('badge', 40)->nullable();
            $table->string('battery_capacity', 40)->nullable();
            $table->string('motor_output', 40)->nullable();
            $table->text('description');
            $table->enum('status', ['available', 'sold', 'hidden'])->default('available')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['source', 'status', 'featured'], 'cars_source_status_featured_idx');
            $table->index(['make', 'model'], 'cars_make_model_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cars');
    }
};
