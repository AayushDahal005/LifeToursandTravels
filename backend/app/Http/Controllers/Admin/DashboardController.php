<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Flight;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::where('role', 'user')->count();
        $totalFlights = Flight::count();
        $totalBookings = Booking::count();

        $revenue = Booking::where('payment_status', 'paid')->sum('total_amount');
        $paidBookings = Booking::where('payment_status', 'paid')->count();
        $pendingBookings = Booking::where('payment_status', 'pending')->count();
        $failedBookings = Booking::where('payment_status', 'failed')->count();

        $popularRoutes = Booking::select(
                'flights.from_city',
                'flights.to_city',
                DB::raw('COUNT(bookings.id) as total_bookings'),
                DB::raw('SUM(CASE WHEN bookings.payment_status = "paid" THEN bookings.total_amount ELSE 0 END) as revenue')
            )
            ->join('flights', 'flights.id', '=', 'bookings.flight_id')
            ->groupBy('flights.from_city', 'flights.to_city')
            ->orderByDesc('total_bookings')
            ->limit(5)
            ->get();

        $recentBookings = Booking::with('flight', 'user')
            ->latest()
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users'      => $totalUsers,
                'total_flights'    => $totalFlights,
                'total_bookings'   => $totalBookings,
                'revenue'          => (float) $revenue,
                'paid_bookings'    => $paidBookings,
                'pending_bookings' => $pendingBookings,
                'failed_bookings'  => $failedBookings,
            ],
            'popular_routes'  => $popularRoutes,
            'recent_bookings' => $recentBookings,
        ]);
    }
}