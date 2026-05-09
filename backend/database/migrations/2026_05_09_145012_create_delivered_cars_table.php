<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivered_cars', function (Blueprint $table) {
            $table->id();
            $table->string('make', 60);
            $table->string('model', 120);
            $table->unsignedSmallInteger('year');
            $table->string('customer_name', 120);
            $table->string('destination_country', 80)->index();
            $table->string('destination_city', 80)->nullable();
            $table->date('delivery_date')->index();
            $table->text('testimonial_text')->nullable();
            $table->string('image_path', 500);
            $table->enum('status', ['published', 'hidden'])->default('published');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivered_cars');
    }
};
