<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'flight_id',
        'return_flight_id',
        'is_round_trip',
        'passengers',
        'contact',
        'base_fare',
        'discount',
        'vat',
        'total_amount',
        'promo_code',
        'want_vat_bill',
        'transaction_uuid',
        'payment_status',
        'payment_method',
        'paid_at',
    ];

    protected $casts = [
        'passengers' => 'array',
        'contact' => 'array',
        'want_vat_bill' => 'boolean',
        'is_round_trip' => 'boolean',
        'paid_at' => 'datetime',
        'base_fare' => 'decimal:2',
        'discount' => 'decimal:2',
        'vat' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function flight()
    {
        return $this->belongsTo(Flight::class);
    }

    public function returnFlight()
    {
        return $this->belongsTo(Flight::class, 'return_flight_id');
    }
}