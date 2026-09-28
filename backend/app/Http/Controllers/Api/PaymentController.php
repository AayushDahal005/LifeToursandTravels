<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Khalti ePayment v2 endpoints
     */
    private const KHALTI_INITIATE_URL_TEST = 'https://dev.khalti.com/api/v2/epayment/initiate/';
    private const KHALTI_LOOKUP_URL_TEST   = 'https://dev.khalti.com/api/v2/epayment/lookup/';
    private const KHALTI_INITIATE_URL_LIVE = 'https://khalti.com/api/v2/epayment/initiate/';
    private const KHALTI_LOOKUP_URL_LIVE   = 'https://khalti.com/api/v2/epayment/lookup/';

    /**
     * Step 1: Create booking + return Khalti payment URL for redirect
     */
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'flight_id'       => 'required|exists:flights,id',
            'passengers'      => 'required|array|min:1',
            'contact'         => 'required|array',
            'base_fare'       => 'required|numeric|min:0',
            'discount'        => 'nullable|numeric|min:0',
            'vat'             => 'nullable|numeric|min:0',
            'total_amount'    => 'required|numeric|min:1',
            'promo_code'      => 'nullable|string',
            'want_vat_bill'   => 'boolean',
        ]);

        // 1. Create the booking record (pending payment)
        $booking = Booking::create([
            'user_id'         => Auth::id(),
            'flight_id'       => $request->flight_id,
            'passengers'      => $request->passengers,
            'contact'         => $request->contact,
            'base_fare'       => $request->base_fare,
            'discount'        => $request->discount ?? 0,
            'vat'             => $request->vat ?? 0,
            'total_amount'    => $request->total_amount,
            'promo_code'      => $request->promo_code,
            'want_vat_bill'   => $request->want_vat_bill ?? false,
            'payment_status'  => 'pending',
        ]);

        // 2. Generate unique transaction UUID tied to the booking
        $transactionUuid = 'LT-' . $booking->id . '-' . Str::upper(Str::random(6));
        $booking->update(['transaction_uuid' => $transactionUuid]);

        // 3. Prepare Khalti initiate payload
        $isLive = env('KHALTI_ENVIRONMENT') === 'live';
        $initiateUrl = $isLive ? self::KHALTI_INITIATE_URL_LIVE : self::KHALTI_INITIATE_URL_TEST;

        // Khalti expects amount in PAISA (Rs. 1 = 100 paisa)
        $amountInPaisa = (int) round((float) $request->total_amount * 100);

        $payload = [
            'return_url'          => url('/api/payment/khalti/success'),
            'website_url'         => env('FRONTEND_URL', 'http://localhost:5173'),
            'amount'              => $amountInPaisa,
            'purchase_order_id'   => $transactionUuid,
            'purchase_order_name' => 'Flight Booking #' . $booking->id,
            'customer_info'       => [
                'name'  => $request->contact['name'] ?? 'Guest',
                'email' => $request->contact['email'] ?? 'guest@example.com',
                'phone' => $request->contact['phone'] ?? '',
            ],
        ];

        // 4. Call Khalti Initiate API
        $response = Http::withHeaders([
            'Authorization' => 'key ' . env('KHALTI_SECRET_KEY'),
            'Content-Type'  => 'application/json',
        ])->post($initiateUrl, $payload);

        if ($response->failed()) {
            $booking->update(['payment_status' => 'failed']);

            return response()->json([
                'success' => false,
                'message' => 'Khalti initiation failed',
                'error'   => $response->json() ?: $response->body(),
            ], 500);
        }

        $data = $response->json();

        if (!isset($data['payment_url'])) {
            $booking->update(['payment_status' => 'failed']);

            return response()->json([
                'success' => false,
                'message' => 'Invalid response from Khalti',
                'error'   => $data,
            ], 500);
        }

        // 5. Return the payment_url to the React frontend
        return response()->json([
            'success'     => true,
            'booking_id'  => $booking->id,
            'payment_url' => $data['payment_url'],
            'pidx'        => $data['pidx'] ?? null,
        ]);
    }

    /**
     * Step 2: Khalti redirects user here after payment (success)
     */
    public function khaltiSuccess(Request $request)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        // Khalti returns these query params on success:
        // pidx, transaction_id, tid, amount, mobile, status,
        // purchase_order_id, purchase_order_name
        $pidx            = $request->query('pidx');
        $purchaseOrderId = $request->query('purchase_order_id');
        $status          = $request->query('status');

        if (!$pidx || !$purchaseOrderId) {
            return redirect($frontendUrl . '/payment-failure?reason=no_data');
        }

        // Find the booking
        $booking = Booking::where('transaction_uuid', $purchaseOrderId)->first();

        if (!$booking) {
            return redirect($frontendUrl . '/payment-failure?reason=booking_not_found');
        }

        // Verify the transaction with Khalti's Lookup API (server-side)
        $verified = $this->verifyWithKhalti($pidx);

        if ($verified && isset($verified['status']) && $verified['status'] === 'Completed') {
            $booking->update([
                'payment_status' => 'paid',
                'payment_method' => 'khalti',
                'paid_at'        => now(),
            ]);

            return redirect($frontendUrl . '/payment-success?booking_id=' . $booking->id);
        }

        // If not verified as Completed, mark as failed
        $booking->update(['payment_status' => 'failed']);

        return redirect($frontendUrl . '/payment-failure?reason=verification_failed');
    }

    /**
     * Step 3: Khalti redirects user here after payment (failure/cancel)
     */
    public function khaltiFailure(Request $request)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $purchaseOrderId = $request->query('purchase_order_id');

        if ($purchaseOrderId) {
            Booking::where('transaction_uuid', $purchaseOrderId)
                ->update(['payment_status' => 'failed']);
        }

        return redirect($frontendUrl . '/payment-failure?reason=cancelled');
    }

    /**
     * Verify transaction with Khalti Lookup API
     */
    private function verifyWithKhalti(string $pidx): ?array
    {
        $isLive = env('KHALTI_ENVIRONMENT') === 'live';
        $lookupUrl = $isLive ? self::KHALTI_LOOKUP_URL_LIVE : self::KHALTI_LOOKUP_URL_TEST;

        $response = Http::withHeaders([
            'Authorization' => 'key ' . env('KHALTI_SECRET_KEY'),
            'Content-Type'  => 'application/json',
        ])->post($lookupUrl, [
            'pidx' => $pidx,
        ]);

        if ($response->failed()) {
            return null;
        }

        $data = $response->json();
        return is_array($data) ? $data : null;
    }
}