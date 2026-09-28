<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Flight;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FlightController extends Controller
{
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'airline'         => 'required|string|max:100',
            'flight_number'   => 'required|string|max:20',
            'from_city'       => 'required|string|max:50',
            'to_city'         => 'required|string|max:50|different:from_city',
            'departure_time'  => 'required',
            'arrival_time'    => 'required',
            'duration'        => 'required|string|max:20',
            'fare'            => 'required|numeric|min:0',
            'refundable'      => 'boolean',
            'aircraft'        => 'nullable|string|max:50',
            'baggage'         => 'nullable|string|max:100',
            'seats_available' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $flight = Flight::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Flight created successfully',
            'flight'  => $flight,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json(['success' => false, 'message' => 'Flight not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'airline'         => 'sometimes|required|string|max:100',
            'flight_number'   => 'sometimes|required|string|max:20',
            'from_city'       => 'sometimes|required|string|max:50',
            'to_city'         => 'sometimes|required|string|max:50',
            'departure_time'  => 'sometimes|required',
            'arrival_time'    => 'sometimes|required',
            'duration'        => 'sometimes|required|string|max:20',
            'fare'            => 'sometimes|required|numeric|min:0',
            'refundable'      => 'boolean',
            'aircraft'        => 'nullable|string|max:50',
            'baggage'         => 'nullable|string|max:100',
            'seats_available' => 'sometimes|required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $flight->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Flight updated successfully',
            'flight'  => $flight->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $flight = Flight::find($id);

        if (!$flight) {
            return response()->json(['success' => false, 'message' => 'Flight not found'], 404);
        }

        // Prevent delete if bookings exist
        if ($flight->bookings()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete — this flight has existing bookings.',
            ], 400);
        }

        $flight->delete();

        return response()->json([
            'success' => true,
            'message' => 'Flight deleted successfully',
        ]);
    }
}