<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
   public function index(Request $request)
{
    $query = Booking::with('flight', 'user')->latest();

    if ($request->has('status') && $request->status !== 'all') {
        $query->where('payment_status', $request->status);
    }

    if ($request->has('search') && $request->search) {
        $search = $request->search;
        $query->where(function ($q) use ($search) {
            $q->where('transaction_uuid', 'like', "%{$search}%")
              ->orWhereHas('user', function ($u) use ($search) {
                  $u->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
              });
        });
    }

    $bookings = $query->paginate(20);

    return response()->json([
        'success'  => true,
        'bookings' => $bookings,
    ]);
}

    public function show($id)
    {
        $booking = Booking::with('flight', 'user')->find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        return response()->json([
            'success' => true,
            'booking' => $booking,
        ]);
    }

    public function confirm($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $booking->update([
            'payment_status' => 'paid',
            'paid_at' => now(),
            'payment_method' => $booking->payment_method ?? 'manual',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Booking confirmed successfully',
            'booking' => $booking->fresh(),
        ]);
    }

    public function cancel($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
        }

        $booking->update(['payment_status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled',
            'booking' => $booking->fresh(),
        ]);
    }
    /**
 * Update passenger details of a booking
 */
public function updatePassengers(Request $request, $id)
{
    $booking = Booking::find($id);

    if (!$booking) {
        return response()->json(['success' => false, 'message' => 'Booking not found'], 404);
    }

    $validator = Validator::make($request->all(), [
        'passengers'                    => 'required|array|min:1',
        'passengers.*.title'            => 'required|string|max:10',
        'passengers.*.fullName'         => 'required|string|max:255',
        'passengers.*.dob'              => 'required|date',
        'passengers.*.gender'           => 'required|string|max:20',
        'passengers.*.nationality'      => 'required|string|max:100',
        'passengers.*.passportNumber'   => 'required|string|max:100',
        'passengers.*.type'             => 'required|string|in:Adult,Child',
        'contact'                       => 'nullable|array',
        'contact.name'                  => 'nullable|string|max:255',
        'contact.phone'                 => 'nullable|string|max:30',
        'contact.email'                 => 'nullable|email|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    $booking->passengers = $request->passengers;

    if ($request->filled('contact')) {
        $booking->contact = array_merge($booking->contact ?? [], $request->contact);
    }

    $booking->save();

    return response()->json([
        'success' => true,
        'message' => 'Passenger details updated successfully',
        'booking' => $booking->fresh()->load('flight', 'user'),
    ]);
}
}