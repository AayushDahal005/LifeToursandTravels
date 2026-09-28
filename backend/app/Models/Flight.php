<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    use HasFactory;

    protected $fillable = [
        'airline',
        'flight_number',
        'from_city',
        'to_city',
        'departure_time',
        'arrival_time',
        'duration',
        'fare',
        'refundable',
        'aircraft',
        'baggage',
        'seats_available',
    ];

    protected $casts = [
        'refundable' => 'boolean',
        'fare' => 'decimal:2',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}