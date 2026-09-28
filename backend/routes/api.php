<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FlightController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\FlightController as AdminFlightController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ============================
// PUBLIC ROUTES (no auth needed)
// ============================

// Auth routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Flight routes (public - search doesn't need auth)
Route::get('/flights', [FlightController::class, 'index']);
Route::get('/flights/search', [FlightController::class, 'search']);
Route::get('/flights/{id}', [FlightController::class, 'show']);

// Payment callback routes (Khalti redirects the browser here - NO auth)
Route::get('/payment/khalti/success', [PaymentController::class, 'khaltiSuccess']);
Route::get('/payment/khalti/failure', [PaymentController::class, 'khaltiFailure']);

// Test route
Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working!',
        'status' => 'success',
    ]);
});

// ============================
// PROTECTED ROUTES (auth:sanctum) — for regular users
// ============================
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Payment
    Route::post('/payment/initiate', [PaymentController::class, 'initiatePayment']);

    // User's own bookings
    Route::get('/my-bookings', [BookingController::class, 'myBookings']);

    // Booking downloads (e-ticket + invoice)
    Route::get('/bookings/{id}/ticket', [BookingController::class, 'downloadTicket']);
    Route::get('/bookings/{id}/invoice', [BookingController::class, 'downloadInvoice']);

    // Products (sample)
    Route::get('/products', function () {
        return response()->json([
            ['id' => 1, 'name' => 'Product 1', 'price' => 99.99],
            ['id' => 2, 'name' => 'Product 2', 'price' => 149.99],
        ]);
    });
});

// ============================
// ADMIN ROUTES (auth:sanctum + admin)
// ============================
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard stats
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    // Manage flights
    Route::get('/flights', [AdminFlightController::class, 'index']);
    Route::post('/flights', [AdminFlightController::class, 'store']);
    Route::put('/flights/{id}', [AdminFlightController::class, 'update']);
    Route::delete('/flights/{id}', [AdminFlightController::class, 'destroy']);

    // Manage bookings
    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::get('/bookings/{id}', [AdminBookingController::class, 'show']);
    Route::post('/bookings/{id}/confirm', [AdminBookingController::class, 'confirm']);
    Route::post('/bookings/{id}/cancel', [AdminBookingController::class, 'cancel']);
    Route::put('/bookings/{id}/passengers', [AdminBookingController::class, 'updatePassengers']);

    // Manage users
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::post('/users/{id}/toggle-active', [AdminUserController::class, 'toggleActive']);
});