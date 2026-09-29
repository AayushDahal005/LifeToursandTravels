<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    /**
     * Search flights by from, to, and date
     */
   public function search(Request $request)
{
    $request->validate([
        'from' => 'required|string',
        'to' => 'required|string',
        'trip_type' => 'nullable|in:oneway,roundtrip',
    ]);

    // Outbound flights
    $outbound = Flight::where('from_city', $request->from)
        ->where('to_city', $request->to)
        ->orderBy('departure_time')
        ->get();

    // Return flights (only for round trip)
    $returnFlights = [];
    if ($request->trip_type === 'roundtrip') {
        $returnFlights = Flight::where('from_city', $request->to)
            ->where('to_city', $request->from)
            ->orderBy('departure_time')
            ->get();
    }

    return response()->json([
        'success' => true,
        'count' => $outbound->count(),
        'flights' => $outbound,                 // backward compat
        'outbound' => $outbound,
        'return_flights' => $returnFlights,
        'trip_type' => $request->trip_type ?? 'oneway',
    ]);
}

    /**
     * Get flight details
     */
    public function show($id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json([
                'success' => false,
                'message' => 'Flight not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'flight' => $flight,
        ]);
    }

    /**
     * Get all flights
     */
    public function index()
    {
        $flights = Flight::orderBy('from_city')
            ->orderBy('to_city')
            ->orderBy('departure_time')
            ->get();

        return response()->json([
            'success' => true,
            'flights' => $flights,
        ]);
    }
}