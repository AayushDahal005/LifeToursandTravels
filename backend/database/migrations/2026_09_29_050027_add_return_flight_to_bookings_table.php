<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('return_flight_id')->nullable()->after('flight_id')
                ->constrained('flights')->onDelete('set null');
            $table->boolean('is_round_trip')->default(false)->after('return_flight_id');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['return_flight_id']);
            $table->dropColumn(['return_flight_id', 'is_round_trip']);
        });
    }
};