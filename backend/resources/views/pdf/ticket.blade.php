<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>E-Ticket {{ $booking->transaction_uuid }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            color: #12263A;
            font-size: 12px;
            line-height: 1.5;
        }
        .container { padding: 30px; }

        /* Header */
        .header {
            background: #12263A;
            color: white;
            padding: 20px 25px;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header .brand h1 { font-size: 20px; margin-bottom: 3px; color: #F2A541; }
        .header .brand p { font-size: 11px; opacity: 0.85; }
        .header .ref { text-align: right; }
        .header .ref .label {
            font-size: 9px;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header .ref .value {
            font-size: 16px;
            font-weight: bold;
            color: #F2A541;
        }

        /* Status Banner */
        .status-banner {
            background: #D1FAE5;
            color: #065F46;
            padding: 10px 25px;
            font-size: 11px;
            font-weight: bold;
            text-align: center;
            border-bottom: 3px solid #10B981;
        }

        /* Section */
        .section {
            padding: 20px 25px;
            border-bottom: 1px dashed #D9E2E8;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #2E86AB;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 2px solid #EAF4FA;
        }

        /* Flight Info */
        .flight-route {
            display: table;
            width: 100%;
            margin-bottom: 15px;
        }
        .flight-route .point {
            display: table-cell;
            vertical-align: middle;
        }
        .flight-route .point.center { text-align: center; width: 40%; }
        .flight-route .point.right { text-align: right; }
        .flight-route .city {
            font-size: 22px;
            font-weight: bold;
            color: #12263A;
        }
        .flight-route .time {
            font-size: 14px;
            color: #5A6B7A;
            margin-top: 3px;
        }
        .flight-route .arrow {
            font-size: 20px;
            color: #F2A541;
        }
        .flight-route .duration {
            font-size: 10px;
            color: #5A6B7A;
        }

        /* Info Grid */
        .info-grid {
            display: table;
            width: 100%;
            margin-top: 10px;
        }
        .info-grid .row { display: table-row; }
        .info-grid .cell {
            display: table-cell;
            padding: 6px 0;
            width: 50%;
        }
        .info-grid .cell .label {
            color: #5A6B7A;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .info-grid .cell .value {
            color: #12263A;
            font-weight: bold;
            font-size: 12px;
            margin-top: 2px;
        }

        /* Passengers Table */
        .passengers-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }
        .passengers-table th {
            background: #EAF4FA;
            color: #12263A;
            font-size: 10px;
            text-transform: uppercase;
            padding: 8px;
            text-align: left;
            border-bottom: 2px solid #2E86AB;
        }
        .passengers-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #EAF4FA;
            font-size: 11px;
        }
        .passengers-table tr:last-child td { border-bottom: none; }
        .passengers-table .pax-type {
            display: inline-block;
            background: #FEF3E2;
            color: #8a5a20;
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }

        /* Important Notes */
        .notes {
            background: #FEF3E2;
            padding: 12px 15px;
            border-left: 3px solid #F2A541;
            border-radius: 4px;
            font-size: 10px;
            color: #8a5a20;
            margin-top: 15px;
            line-height: 1.6;
        }
        .notes strong { display: block; margin-bottom: 4px; }

        /* Footer */
        .footer {
            background: #12263A;
            color: white;
            padding: 15px 25px;
            text-align: center;
            border-radius: 0 0 8px 8px;
            font-size: 10px;
            margin-top: 20px;
        }
        .footer p { margin-bottom: 3px; opacity: 0.85; }
        .footer .contact { color: #F2A541; font-weight: bold; }

        /* Watermark */
        .watermark {
            position: fixed;
            top: 40%;
            left: 15%;
            font-size: 90px;
            color: rgba(18, 38, 58, 0.04);
            transform: rotate(-30deg);
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        {{-- WATERMARK --}}
        <div class="watermark">CONFIRMED</div>

        {{-- HEADER --}}
        <div class="header">
            <div class="brand">
                <h1>✈ Life Tours &amp; Travels Pvt Ltd.</h1>
                <p>E-Ticket / Boarding Pass</p>
            </div>
            <div class="ref">
                <div class="label">Booking Reference</div>
                <div class="value">{{ $booking->transaction_uuid }}</div>
            </div>
        </div>

        {{-- STATUS --}}
        <div class="status-banner">
            ✓ BOOKING CONFIRMED — {{ strtoupper($booking->payment_method) }} PAYMENT
        </div>

        {{-- FLIGHT DETAILS --}}
        <div class="section">
            <div class="section-title">Flight Details</div>

            <div class="flight-route">
                <div class="point">
                    <div class="city">{{ $flight->from_city }}</div>
                    <div class="time">{{ \Carbon\Carbon::parse($flight->departure_time)->format('h:i A') }}</div>
                </div>
                <div class="point center">
                    <div class="arrow">✈  →</div>
                    <div class="duration">{{ $flight->duration }}</div>
                </div>
                <div class="point right">
                    <div class="city">{{ $flight->to_city }}</div>
                    <div class="time">{{ \Carbon\Carbon::parse($flight->arrival_time)->format('h:i A') }}</div>
                </div>
            </div>

            <div class="info-grid">
                <div class="row">
                    <div class="cell">
                        <div class="label">Airline</div>
                        <div class="value">{{ $flight->airline }}</div>
                    </div>
                    <div class="cell">
                        <div class="label">Flight Number</div>
                        <div class="value">{{ $flight->flight_number }}</div>
                    </div>
                </div>
                <div class="row">
                    <div class="cell">
                        <div class="label">Aircraft</div>
                        <div class="value">{{ $flight->aircraft }}</div>
                    </div>
                    <div class="cell">
                        <div class="label">Travel Class</div>
                        <div class="value">Economy</div>
                    </div>
                </div>
                <div class="row">
                    <div class="cell">
                        <div class="label">Baggage Allowance</div>
                        <div class="value">{{ $flight->baggage }}</div>
                    </div>
                    <div class="cell">
                        <div class="label">Refund Policy</div>
                        <div class="value">
                            {{ $flight->refundable ? 'Refundable' : 'Non-refundable' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- PASSENGERS --}}
        <div class="section">
            <div class="section-title">Passenger Details ({{ count($passengers) }})</div>

            <table class="passengers-table">
                <thead>
                    <tr>
                        <th style="width: 30px;">#</th>
                        <th>Passenger Name</th>
                        <th style="width: 60px;">Type</th>
                        <th style="width: 80px;">Gender</th>
                        <th style="width: 110px;">Passport/ID</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($passengers as $index => $pax)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td><strong>{{ $pax['title'] }} {{ $pax['fullName'] }}</strong></td>
                        <td><span class="pax-type">{{ strtoupper($pax['type']) }}</span></td>
                        <td>{{ $pax['gender'] }}</td>
                        <td>{{ $pax['passportNumber'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        {{-- CONTACT --}}
        <div class="section">
            <div class="section-title">Contact Information</div>
            <div class="info-grid">
                <div class="row">
                    <div class="cell">
                        <div class="label">Contact Name</div>
                        <div class="value">{{ $contact['name'] }}</div>
                    </div>
                    <div class="cell">
                        <div class="label">Contact Number</div>
                        <div class="value">{{ $contact['phone'] }}</div>
                    </div>
                </div>
                @if(!empty($contact['email']))
                <div class="row">
                    <div class="cell">
                        <div class="label">Email Address</div>
                        <div class="value">{{ $contact['email'] }}</div>
                    </div>
                    <div class="cell"></div>
                </div>
                @endif
            </div>
        </div>

        {{-- NOTES --}}
        <div class="section" style="border-bottom: none;">
            <div class="notes">
                <strong>⚠ Important Instructions</strong>
                • Please arrive at the airport at least 1 hour before departure.<br>
                • Carry a valid photo ID / Passport for all passengers.<br>
                • This e-ticket is non-transferable and valid only for the date and time shown.<br>
                • For any assistance, contact us at +977-9810342647.
            </div>
        </div>
    </div>

    {{-- FOOTER --}}
    <div class="footer">
        <p><strong>{{ $company['name'] }}</strong></p>
        <p>{{ $company['address'] }} &nbsp;|&nbsp; {{ $company['email'] }}</p>
        <p class="contact">{{ $company['phone'] }} &nbsp;|&nbsp; {{ $company['website'] }}</p>
        <p style="margin-top: 8px; font-size: 9px;">Generated on {{ $generatedAt }} — Thank you for choosing us!</p>
    </div>
</body>
</html>