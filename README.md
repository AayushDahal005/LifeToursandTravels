# Life Tours & Travels — Flight Booking System

A full-stack flight booking platform built with **Laravel 11** (backend) and **React + Vite** (frontend).

## Features

### User Side
- User registration & login
- Flight search (one-way / round-trip)
- Booking with passenger details, VAT option, promo codes
- Khalti payment integration
- E-ticket and invoice PDF downloads
- User profile and booking history

### Admin Side
- Separate admin login tab
- Dashboard with stats and top routes
- Manage flights (create, edit, delete)
- Manage bookings (view, confirm, cancel, edit passengers)
- Manage users (activate/deactivate)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11, MySQL, Sanctum |
| Frontend | React 18, Vite, React Router, Axios |
| Payments | Khalti (ePayment v2) |
| PDFs | barryvdh/laravel-dompdf |

## Setup

### Backend
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configure .env with DB credentials and Khalti secret key
php artisan migrate --seed
php artisan serve