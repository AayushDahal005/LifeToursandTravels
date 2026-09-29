<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    /**
     * List the authenticated user's bookings
     */
    public function myBookings()
{
    $bookings = Booking::with(['flight', 'returnFlight'])
        ->where('user_id', Auth::id())
        ->latest()
        ->get();

    return response()->json([
        'success' => true,
        'bookings' => $bookings,
    ]);
}

    /**
     * Download e-ticket PDF
     */
    public function downloadTicket($id)
    {
        $booking = Booking::with('flight','returnFlight', 'user')->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        if ($booking->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->payment_status !== 'paid') {
            return response()->json(['message' => 'Booking not paid yet'], 400);
        }

        $data = [
            'booking'     => $booking,
            'flight'      => $booking->flight,
            'passengers'  => $booking->passengers,
            'contact'     => $booking->contact,
            'company'     => [
                'name'    => 'Life Tours & Travels Pvt Ltd.',
                'address' => 'Kathmandu, Nepal',
                'email'   => 'info@lifetoursandtravels.com',
                'phone'   => '+977-9810342647',
                'website' => 'www.lifetoursandtravels.com',
            ],
            'generatedAt' => now()->format('d M Y, h:i A'),
        ];

        $pdf = Pdf::loadView('pdf.ticket', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('eticket-' . $booking->transaction_uuid . '.pdf');
    }

    /**
     * Download invoice PDF
     */
    public function downloadInvoice($id)
    {
        $booking = Booking::with('flight','returnFlight', 'user')->find($id);

        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        if ($booking->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->payment_status !== 'paid') {
            return response()->json(['message' => 'Booking not paid yet'], 400);
        }

        $data = [
            'booking'      => $booking,
            'flight'       => $booking->flight,
            'passengers'   => $booking->passengers,
            'contact'      => $booking->contact,
            'wantVatBill'  => (bool) $booking->want_vat_bill,
            'company'      => [
                'name'    => 'Life Tours & Travels Pvt Ltd.',
                'address' => 'Kathmandu, Nepal',
                'email'   => 'info@lifetoursandtravels.com',
                'phone'   => '+977-9810342647',
                'pan'     => '123456789',
                'website' => 'www.lifetoursandtravels.com',
            ],
            'invoiceNo'   => 'INV-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
            'invoiceDate' => now()->format('d M Y'),
            'generatedAt' => now()->format('d M Y, h:i A'),
        ];

        $pdf = Pdf::loadView('pdf.invoice', $data);
        $pdf->setPaper('a4', 'portrait');

        return $pdf->download('invoice-' . $booking->transaction_uuid . '.pdf');
    }
}