<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $invoiceNo }}</title>
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
            display: table;
            width: 100%;
            margin-bottom: 25px;
            border-bottom: 3px solid #12263A;
            padding-bottom: 15px;
        }
        .header .left { display: table-cell; vertical-align: top; }
        .header .right { display: table-cell; vertical-align: top; text-align: right; }
        .header .brand h1 {
            font-size: 22px;
            color: #12263A;
            margin-bottom: 5px;
        }
        .header .brand h1 span { color: #F2A541; }
        .header .brand .tag {
            font-size: 10px;
            color: #5A6B7A;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .header .brand .info {
            font-size: 10px;
            color: #5A6B7A;
            margin-top: 8px;
            line-height: 1.6;
        }
        .header .invoice-details {
            font-size: 11px;
            color: #5A6B7A;
            line-height: 1.8;
        }
        .header .invoice-details .inv-title {
            font-size: 26px;
            font-weight: bold;
            color: #F2A541;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }
        .header .invoice-details strong { color: #12263A; }

        /* VAT Badge */
        .vat-badge {
            display: inline-block;
            background: #065F46;
            color: white;
            font-size: 9px;
            font-weight: bold;
            padding: 4px 10px;
            border-radius: 3px;
            letter-spacing: 0.5px;
            margin-top: 5px;
        }
        .vat-badge.no-vat {
            background: #5A6B7A;
        }

        /* Bill To */
        .bill-to {
            background: #EAF4FA;
            padding: 15px 20px;
            border-radius: 6px;
            margin-bottom: 20px;
        }
        .bill-to .label {
            font-size: 10px;
            color: #2E86AB;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }
        .bill-to .name {
            font-size: 15px;
            font-weight: bold;
            color: #12263A;
            margin-bottom: 3px;
        }
        .bill-to .detail { font-size: 11px; color: #5A6B7A; }

        /* Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background: #12263A;
            color: white;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 12px 10px;
            text-align: left;
        }
        .items-table th.right { text-align: right; }
        .items-table td {
            padding: 12px 10px;
            border-bottom: 1px solid #EAF4FA;
            font-size: 11px;
            vertical-align: top;
        }
        .items-table td.right { text-align: right; }
        .items-table tr:last-child td { border-bottom: none; }
        .items-table .item-title {
            font-weight: bold;
            color: #12263A;
            margin-bottom: 3px;
            font-size: 12px;
        }
        .items-table .item-desc {
            color: #5A6B7A;
            font-size: 10px;
            line-height: 1.5;
        }

        /* Summary */
        .summary-table {
            width: 45%;
            margin-left: auto;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .summary-table td {
            padding: 8px 10px;
            font-size: 11px;
        }
        .summary-table .label { color: #5A6B7A; }
        .summary-table .amount { text-align: right; color: #12263A; font-weight: bold; }
        .summary-table .discount .amount { color: #065F46; }
        .summary-table .vat-row .amount { color: #12263A; }
        .summary-table .subtotal td {
            border-top: 1px solid #D9E2E8;
            padding-top: 12px;
        }
        .summary-table .total td {
            background: #F2A541;
            color: #12263A;
            font-size: 15px;
            font-weight: bold;
            padding: 12px 10px;
            border-radius: 4px;
        }

        /* VAT Details Box */
        .vat-info {
            background: #F0FDF4;
            border: 1px solid #86EFAC;
            border-radius: 6px;
            padding: 12px 18px;
            margin-bottom: 20px;
            font-size: 10px;
            color: #065F46;
        }
        .vat-info .title {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 5px;
        }

        /* Non-VAT notice */
        .no-vat-notice {
            background: #F3F4F6;
            border-left: 3px solid #5A6B7A;
            padding: 10px 15px;
            border-radius: 4px;
            font-size: 10px;
            color: #5A6B7A;
            margin-bottom: 20px;
        }

        /* Payment info */
        .payment-info {
            background: #EAF4FA;
            padding: 12px 18px;
            border-radius: 6px;
            font-size: 10px;
            color: #12263A;
            margin-bottom: 20px;
        }
        .payment-info strong { color: #2E86AB; }

        /* Footer */
        .footer {
            border-top: 2px solid #EAF4FA;
            padding-top: 15px;
            text-align: center;
            font-size: 10px;
            color: #5A6B7A;
        }
        .footer .thanks {
            font-size: 13px;
            color: #F2A541;
            font-weight: bold;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        {{-- HEADER --}}
        <div class="header">
            <div class="left">
                <div class="brand">
                    <h1>Life Tours <span>&amp;</span> Travels</h1>
                    <div class="tag">Pvt Ltd. — Flight Booking Services</div>
                    <div class="info">
                        {{ $company['address'] }}<br>
                        {{ $company['email'] }} &nbsp;|&nbsp; {{ $company['phone'] }}<br>
                        PAN: {{ $company['pan'] }}
                    </div>
                </div>
            </div>
            <div class="right">
                <div class="invoice-details">
                    <div class="inv-title">INVOICE</div>
                    <div><strong>{{ $invoiceNo }}</strong></div>
                    <div>Date: {{ $invoiceDate }}</div>
                    <div>Booking: {{ $booking->transaction_uuid }}</div>
                    @if($wantVatBill)
                        <div class="vat-badge">✓ VAT REGISTERED BILL</div>
                    @else
                        <div class="vat-badge no-vat">NON-VAT BILL</div>
                    @endif
                </div>
            </div>
        </div>

        {{-- BILL TO --}}
        <div class="bill-to">
            <div class="label">Billed To</div>
            <div class="name">{{ $contact['name'] }}</div>
            <div class="detail">{{ $contact['phone'] }}</div>
            @if(!empty($contact['email']))
                <div class="detail">{{ $contact['email'] }}</div>
            @endif
        </div>

        {{-- ITEMS TABLE --}}
        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="width: 60px;">Qty</th>
                    <th class="right" style="width: 100px;">Rate (Rs.)</th>
                    <th class="right" style="width: 100px;">Amount (Rs.)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="item-title">{{ $flight->airline }} — Flight Ticket</div>
                        <div class="item-desc">
                            {{ $flight->from_city }} → {{ $flight->to_city }}<br>
                            Flight: {{ $flight->flight_number }} | Departure: {{ \Carbon\Carbon::parse($flight->departure_time)->format('h:i A') }}
                        </div>
                    </td>
                    <td>{{ count($passengers) }}</td>
                    <td class="right">{{ number_format($booking->base_fare / count($passengers), 2) }}</td>
                    <td class="right">{{ number_format($booking->base_fare, 2) }}</td>
                </tr>
            </tbody>
        </table>

        {{-- SUMMARY --}}
        <table class="summary-table">
            <tr>
                <td class="label">Subtotal</td>
                <td class="amount">Rs. {{ number_format($booking->base_fare, 2) }}</td>
            </tr>

            @if($booking->discount > 0)
            <tr class="discount">
                <td class="label">Discount @if($booking->promo_code)({{ $booking->promo_code }})@endif</td>
                <td class="amount">− Rs. {{ number_format($booking->discount, 2) }}</td>
            </tr>
            @endif

            @if($wantVatBill && $booking->vat > 0)
            <tr class="vat-row subtotal">
                <td class="label">Taxable Amount</td>
                <td class="amount">Rs. {{ number_format($booking->base_fare - $booking->discount, 2) }}</td>
            </tr>
            <tr class="vat-row">
                <td class="label">VAT @ 13%</td>
                <td class="amount">Rs. {{ number_format($booking->vat, 2) }}</td>
            </tr>
            @endif

            <tr class="total">
                <td>Total Amount</td>
                <td class="amount">Rs. {{ number_format($booking->total_amount, 2) }}</td>
            </tr>
        </table>

        {{-- VAT DETAILS or NON-VAT NOTICE --}}
        @if($wantVatBill && $booking->vat > 0)
            <div class="vat-info">
                <div class="title">VAT Breakdown (For your records)</div>
                Taxable Amount: Rs. {{ number_format($booking->base_fare - $booking->discount, 2) }}<br>
                VAT @ 13%: Rs. {{ number_format($booking->vat, 2) }}<br>
                <strong>Total VAT Included: Rs. {{ number_format($booking->vat, 2) }}</strong>
            </div>
        @else
            <div class="no-vat-notice">
                <strong>Note:</strong> This is a Non-VAT bill. No VAT has been charged on this transaction.
                If you require a VAT bill, please contact us before booking.
            </div>
        @endif

        {{-- PAYMENT INFO --}}
        <div class="payment-info">
            <strong>Payment Method:</strong> {{ strtoupper($booking->payment_method) }} &nbsp;|&nbsp;
            <strong>Payment Status:</strong> PAID &nbsp;|&nbsp;
            <strong>Paid On:</strong>
            {{ $booking->paid_at ? \Carbon\Carbon::parse($booking->paid_at)->format('d M Y, h:i A') : '—' }}
        </div>

        {{-- FOOTER --}}
        <div class="footer">
            <div class="thanks">Thank you for your business!</div>
            <p>{{ $company['name'] }} &nbsp;|&nbsp; {{ $company['website'] }}</p>
            <p style="margin-top: 6px; font-size: 9px;">
                This is a computer-generated invoice and does not require a signature.<br>
                Generated on {{ $generatedAt }}
            </p>
        </div>
    </div>
</body>
</html>