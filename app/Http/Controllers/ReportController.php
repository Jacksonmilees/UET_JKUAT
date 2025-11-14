<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Log;
use Dompdf\Dompdf;
use Dompdf\Options;

class ReportController extends Controller
{
    public function finance(Request $request)
    {
        try {
            $startDate = $request->query('start_date');
            $endDate = $request->query('end_date');

            // Basic aggregates
            $txQuery = DB::table('transactions');
            if ($startDate) {
                $txQuery->whereDate('created_at', '>=', $startDate);
            }
            if ($endDate) {
                $txQuery->whereDate('created_at', '<=', $endDate);
            }
            $transactions = $txQuery
                ->select('id','account_id','amount','type','status','reference','payment_method','payer_name','phone_number','created_at')
                ->orderBy('created_at','desc')
                ->get();

            $totals = [
                'credit' => (clone $txQuery)->where('type','credit')->sum('amount'),
                'debit' => (clone $txQuery)->where('type','debit')->sum('amount'),
            ];
            $totals['net'] = $totals['credit'] - $totals['debit'];

            $withdrawals = DB::table('withdrawals')
                ->when($startDate, fn($q) => $q->whereDate('created_at','>=',$startDate))
                ->when($endDate, fn($q) => $q->whereDate('created_at','<=',$endDate))
                ->orderBy('created_at','desc')
                ->get(['id','account_id','amount','phone_number','status','created_at']);

            $projects = DB::table('projects')
                ->orderBy('created_at','desc')
                ->get(['id','title','target_amount','current_amount','account_number','status','created_at']);

            $data = [
                'generated_at' => now()->format('Y-m-d H:i:s'),
                'start_date' => $startDate,
                'end_date' => $endDate,
                'totals' => $totals,
                'transactions' => $transactions,
                'withdrawals' => $withdrawals,
                'projects' => $projects,
            ];

            $html = View::make('reports.finance', $data)->render();

            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();

            $filename = 'finance-report-' . now()->format('Ymd_His') . '.pdf';

            return response($dompdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');
        } catch (\Exception $e) {
            Log::error('Finance report generation failed', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate report'
            ], 500);
        }
    }
}





