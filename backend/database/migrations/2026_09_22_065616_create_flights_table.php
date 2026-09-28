<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flights', function (Blueprint $table) {
            $table->id();
            $table->string('airline');
            $table->string('flight_number');
            $table->string('from_city');
            $table->string('to_city');
            $table->time('departure_time');
            $table->time('arrival_time');
            $table->string('duration'); // e.g., "25 min"
            $table->decimal('fare', 10, 2);
            $table->boolean('refundable')->default(false);
            $table->string('aircraft')->nullable();
            $table->string('baggage')->nullable();
            $table->integer('seats_available')->default(50);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flights');
    }
};