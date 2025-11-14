<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Finance Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #111; }
        h1, h2 { margin: 0 0 6px; }
        .muted { color: #555; }
        .section { margin: 16px 0; }
        .grid { display: table; width: 100%; }
        .col { display: table-cell; vertical-align: top; }
        .stat { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; margin-right: 8px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 6px 8px; }
        th { background: #f9fafb; text-align: left; }
        .right { text-align: right; }
        .small { font-size: 11px; }
    </style>
</head>
<body>
    <h1>Finance Report</h1>
    <div class="muted small">
        Generated: {{ $generated_at }}
        @if($start_date) | From: {{ $start_date }} @endif
        @if($end_date) | To: {{ $end_date }} @endif
    </div>

    <div class="section grid">
        <div class="col stat">
            <div class="small muted">Total Inflow</div>
            <h2>KES {{ number_format($totals['credit'] ?? 0) }}</h2>
        </div>
        <div class="col stat">
            <div class="small muted">Total Outflow</div>
            <h2>KES {{ number_format($totals['debit'] ?? 0) }}</h2>
        </div>
        <div class="col stat">
            <div class="small muted">Net</div>
            <h2>KES {{ number_format(($totals['net'] ?? 0)) }}</h2>
        </div>
    </div>

    <div class="section">
        <h2>Projects</h2>
        <table>
            <thead>
                <tr>
                    <th>Title</th>
                    <th class="right">Current</th>
                    <th class="right">Target</th>
                    <th>Account</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @foreach($projects as $p)
                <tr>
                    <td>{{ $p->title }}</td>
                    <td class="right">KES {{ number_format($p->current_amount ?? 0) }}</td>
                    <td class="right">KES {{ number_format($p->target_amount ?? 0) }}</td>
                    <td>{{ $p->account_number ?? '—' }}</td>
                    <td>{{ $p->status ?? 'active' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Recent Transactions</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th class="right">Amount</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Reference</th>
                    <th>Phone</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transactions as $t)
                <tr>
                    <td>{{ $t->id }}</td>
                    <td class="right">KES {{ number_format($t->amount ?? 0) }}</td>
                    <td>{{ strtoupper($t->type ?? '') }}</td>
                    <td>{{ $t->status }}</td>
                    <td>{{ $t->reference ?? '—' }}</td>
                    <td>{{ $t->phone_number ?? '—' }}</td>
                    <td>{{ $t->created_at }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Withdrawals</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th class="right">Amount</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Created</th>
                </tr>
            </thead>
            <tbody>
                @foreach($withdrawals as $w)
                <tr>
                    <td>#{{ $w->id }}</td>
                    <td class="right">KES {{ number_format($w->amount ?? 0) }}</td>
                    <td>{{ $w->phone_number ?? '—' }}</td>
                    <td>{{ $w->status }}</td>
                    <td>{{ $w->created_at }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>





