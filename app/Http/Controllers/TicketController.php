<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\Ticket;
use App\Services\AccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class TicketController extends Controller
{
    protected $accountService;

    public function __construct(AccountService $accountService)
    {
        $this->accountService = $accountService;
    }

    public function showPurchasePage($mmid)
    {
        try {
            $member = Member::where('MMID', $mmid)->firstOrFail();
            Log::info('Member MMID: ' . $member->MMID);
            return view('tickets.purchase', compact('member'));
        } catch (\Exception $e) {
            Log::error('Error fetching member: ' . $e->getMessage());
            abort(404, 'Member not found');
        }
    }

    public function processPurchase(Request $request, $mmid)
    {
        $request->validate([
            'phone_number' => 'required|regex:/^254[0-9]{9}$/',
            'amount' => 'required|numeric|min:1',
            'buyer_name' => 'required|string',
            'buyer_contact' => 'required|string',
        ]);

        try {
            DB::beginTransaction();

            $billRefNumber = 'TKT-' . $mmid . '-' . Str::random(6);

            $stkPushRequest = new Request([
                'phone_number' => $request->phone_number,
                'amount' => $request->amount,
                'account_number' => $billRefNumber,
                'ticket_number' => $billRefNumber,
                'buyer_name' => $request->buyer_name,
                'buyer_contact' => $request->buyer_contact,
            ]);

            $mpesaController = new MpesaController($this->accountService);
            $response = $mpesaController->initiateSTKPush($stkPushRequest);
            $responseData = $response->getData();

            Log::info('STK Push response', [
                'response_data' => $responseData,
                'success' => $responseData->success ?? false,
                'data' => $responseData->data ?? null
            ]);

            if ($responseData->success) {
                $ticket = Ticket::create([
                    'ticket_number' => $billRefNumber,
                    'member_mmid' => $mmid,
                    'phone_number' => $request->phone_number,
                    'buyer_name' => $request->buyer_name,
                    'buyer_contact' => $request->buyer_contact,
                    'amount' => $request->amount,
                    'payment_status' => 'pending',
                    'checkout_request_id' => $responseData->data->CheckoutRequestID ?? null,
                    'status' => 'pending'
                ]);

                Log::info('Created ticket', [
                    'ticket_number' => $ticket->ticket_number,
                    'checkout_request_id' => $ticket->checkout_request_id,
                    'mpesa_data' => $responseData->data
                ]);

                DB::commit();

                $this->sendSMS($request->phone_number, "Your ticket purchase for {$request->amount} KES is being processed. Ticket Number: {$billRefNumber}-If you fail to receive an STK PUSH Use Paybill: 4131985 Account Number: Your Ticket No.");

                return response()->json([
                    'success' => true,
                    'message' => 'STK push initiated successfully. Please complete the payment on your phone.',
                    'ticket_number' => $billRefNumber,
                    'mpesa_data' => $responseData->data,
                ]);
            }

            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate STK push.',
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Ticket purchase error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing your request.',
            ], 500);
        }
    }

    public function checkPaymentStatus($ticketNumber)
    {
        $ticket = Ticket::where('ticket_number', $ticketNumber)->first();

        if (!$ticket) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found.',
            ], 404);
        }

        if ($ticket->payment_status === 'completed') {
            $this->sendSMS($ticket->phone_number, "Congratulations!...Whoreeey..Your ticket purchase for {$ticket->amount} KES has been completed successfully. Ticket Number: {$ticket->ticket_number} Be blessed for Your Giving....Fundraising Day; 6th April 2025, WELCOME!");

            try {
                $walletOwner = $ticket->member;
                
                if ($walletOwner && !empty($walletOwner->whatsapp)) {
                    $this->sendSMS($walletOwner->whatsapp, 
                        "Congratulations! A ticket purchase for {$ticket->amount} KES has been completed. Ticket Number: {$ticket->ticket_number} and the amount has been successfully been credited in Your MOUT WALLET");
                    
                    Log::info('Wallet owner notification sent', [
                        'mmid' => $ticket->member_mmid,
                        'whatsapp' => $walletOwner->whatsapp,
                        'ticket_number' => $ticket->ticket_number
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Error sending wallet owner notification: ' . $e->getMessage(), [
                    'mmid' => $ticket->member_mmid,
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'ticket_number' => $ticket->ticket_number,
            'buyer_name' => $ticket->buyer_name,
            'amount' => $ticket->amount,
            'payment_status' => $ticket->payment_status,
            'mmid' => $ticket->member_mmid,
        ]);
    }

    public function fetchCompletedTicketSales($mmid)
    {
        try {
            $completedTickets = Ticket::where('member_mmid', $mmid)
                                    ->where('payment_status', 'completed')
                                    ->get();

            if ($completedTickets->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No completed ticket sales found for the given MMID.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'tickets' => $completedTickets,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching completed ticket sales: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'mmid' => $mmid
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the completed ticket sales.',
            ], 500);
        }
    }

    public function getAllCompletedTickets()
    {
        try {
            Log::info('Starting getAllCompletedTickets query');

            $allTickets = Ticket::count();
            Log::info('Total tickets in database: ' . $allTickets);

            $completedCount = Ticket::where('payment_status', 'completed')->count();
            Log::info('Total completed tickets: ' . $completedCount);

            $completedTickets = Ticket::where('payment_status', 'completed')
                                    ->with('member')
                                    ->select(
                                        'ticket_number',
                                        'member_mmid',
                                        'phone_number',
                                        'buyer_name',
                                        'buyer_contact',
                                        'amount',
                                        'payment_status',
                                        'created_at',
                                        'status'
                                    )
                                    ->orderBy('created_at', 'desc')
                                    ->get();

            Log::info('Query completed. Found tickets: ' . $completedTickets->count(), [
                'first_ticket' => $completedTickets->first()
            ]);

            $formattedTickets = [];
            $totalAmount = 0;

            foreach ($completedTickets as $ticket) {
                $formattedTickets[] = [
                    'ticket_number' => $ticket->ticket_number,
                    'member_mmid' => $ticket->member_mmid,
                    'member_whatsapp' => $ticket->member ? $ticket->member->whatsapp : null,
                    'phone_number' => $ticket->phone_number,
                    'buyer_name' => $ticket->buyer_name,
                    'buyer_contact' => $ticket->buyer_contact,
                    'amount' => $ticket->amount,
                    'payment_status' => $ticket->payment_status,
                    'created_at' => $ticket->created_at->format('Y-m-d H:i:s'),
                    'status' => $ticket->status
                ];

                $totalAmount += $ticket->amount;
            }

            return response()->json([
                'success' => true,
                'total_tickets' => count($formattedTickets),
                'total_amount' => $totalAmount,
                'tickets' => $formattedTickets,
                'debug_info' => [
                    'total_tickets_in_db' => $allTickets,
                    'completed_tickets' => $completedCount
                ],
                'message' => count($formattedTickets) > 0 ? 'Tickets retrieved successfully' : 'No completed tickets found'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error in getAllCompletedTickets: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching the completed tickets.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return tickets belonging to the authenticated user (by member_id or phone number).
     */
    public function getMyTickets(Request $request)
    {
        $user = $this->getUserFromBearer($request);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $tickets = Ticket::query()
            ->when($user->member_id, fn ($q) => $q->orWhere('member_mmid', $user->member_id))
            ->orWhere('phone_number', $user->phone_number)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tickets,
        ]);
    }

    public function winnerSelection(Request $request)
    {
        try {
            $completedTickets = Ticket::where('payment_status', 'completed')
                                    ->with('member')
                                    ->get();

            if ($completedTickets->isEmpty()) {
                return view('tickets.winner-selection', [
                    'success' => false,
                    'message' => 'No completed tickets available for winner selection',
                    'tickets' => [],
                    'winner' => null,
                    'topSellers' => []
                ]);
            }

            $ticketsData = $completedTickets->map(function ($ticket) {
                return [
                    'ticket_number' => $ticket->ticket_number,
                    'buyer_name' => $ticket->buyer_name,
                    'buyer_contact' => $ticket->buyer_contact,
                    'member_mmid' => $ticket->member_mmid,
                    'member_name' => $ticket->member ? $ticket->member->name : 'N/A',
                    'amount' => $ticket->amount
                ];
            })->toArray();

            // Calculate top 5 ticket sellers
            $ticketCounts = $completedTickets->groupBy('member_mmid')
                ->map(function ($group) {
                    $member = $group->first()->member;
                    return [
                        'member_mmid' => $group->first()->member_mmid,
                        'member_name' => $member ? $member->name : 'N/A',
                        'ticket_count' => $group->count(),
                        'total_amount' => $group->sum('amount')
                    ];
                })
                ->sortByDesc('ticket_count')
                ->take(5)
                ->values()
                ->all();

            // Select random winner on POST request
            $winner = null;
            if ($request->isMethod('post')) {
                $randomIndex = array_rand($ticketsData);
                $winner = $ticketsData[$randomIndex];
                
                $winningTicket = Ticket::where('ticket_number', $winner['ticket_number'])->first();
                if ($winningTicket) {
                    $winningTicket->update(['status' => 'winner']);
                    $this->sendSMS(
                        $winningTicket->phone_number,
                        "Congratulations {$winner['buyer_name']}! You've won with Ticket #{$winner['ticket_number']} that you bought for {$winner['amount']} KES! Contact us to claim your prize via our MOUT JKUAT MINISTRY treasurer via, 0708405553
                        we thankyou for participation in enhancing our ministry.May God bless you. Regards: MOUT JKUAT MINISTRY"
                    );
                }
            }

            return view('tickets.winner-selection', [
                'success' => true,
                'tickets' => $ticketsData,
                'winner' => $winner,
                'topSellers' => $ticketCounts,
                'message' => $winner ? 'Winner selected successfully!' : 'Tickets loaded successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error in winner selection: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            return view('tickets.winner-selection', [
                'success' => false,
                'message' => 'Error loading tickets for winner selection: ' . $e->getMessage(),
                'tickets' => [],
                'winner' => null,
                'topSellers' => []
            ]);
        }
    }

    protected function sendSMS($to, $message)
    {
        $apiUrl = 'https://blessedtexts.com/api/sms/v1/sendsms';
        $formattedTo = preg_replace('/[^\d]/', '', $to);

        $postData = [
            'api_key' => 'af09ec090e4c42498d52bb2673ff559b',
            'sender_id' => 'FERRITE',
            'message' => $message,
            'phone' => $formattedTo
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        Log::info('SMS sent', ['to' => $formattedTo, 'message' => $message, 'response' => $response]);
    }
}