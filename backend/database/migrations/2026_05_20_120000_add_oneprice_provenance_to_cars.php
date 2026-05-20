<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Provenance columns for OnePrice (JDMAuction OnePrice stock) source.
 *
 * The vendor's lot-detail endpoint needs both `id` and `bid` — we store the
 * `bid` separately so the existing `external_id` can stay the vendor's `id`
 * primary key. The remaining fields are pure provenance for the admin panel
 * and for any future "lot detail" deep-dive on the public site.
 *
 * All columns are nullable: in-house cars have no provenance, and the
 * vendor's payload occasionally omits fields (e.g. grade missing on stock
 * with no AIS inspection).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cars', function (Blueprint $table): void {
            $table->string('lot_bid', 40)->nullable()->after('external_id');
            $table->string('chassis_code', 40)->nullable()->after('lot_bid');
            $table->string('auction_house', 80)->nullable()->after('chassis_code');
            $table->string('auction_grade', 16)->nullable()->after('auction_house');
        });
    }

    public function down(): void
    {
        Schema::table('cars', function (Blueprint $table): void {
            $table->dropColumn(['lot_bid', 'chassis_code', 'auction_house', 'auction_grade']);
        });
    }
};
