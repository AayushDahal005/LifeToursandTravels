<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('flight_id')->constrained()->onDelete('cascade');

            // Passenger and contact info as JSON
            $table->json('passengers');
            $table->json('contact');

            // Fare details
            $table->decimal('base_fare', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('vat', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // Payment info
            $table->string('promo_code')->nullable();
            $table->boolean('want_vat_bill')->default(false);
            $table->string('transaction_uuid')->unique()->nullable();
            $table->string('payment_status')->default('pending'); // pending, paid, failed, cancelled
            $table->string('payment_method')->nullable(); // esewa, khalti, etc.
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};