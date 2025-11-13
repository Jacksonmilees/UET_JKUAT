<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DailyAccountStatement extends Mailable
{
    use Queueable, SerializesModels;

    public $account;
    public $pdf;
    public $statementData;

    public function __construct($account, $pdf, $statementData)
    {
        $this->account = $account;
        $this->pdf = $pdf;
        $this->statementData = $statementData;
    }

    public function build()
    {
        $date = $this->statementData['period']['start'];
        
        return $this->subject("Daily Account Statement - {$date}")
                    ->view('emails.daily-statement')
                    ->attachData(
                        $this->pdf->output(),
                        "statement_{$this->account->reference}_{$date}.pdf",
                        ['mime' => 'application/pdf']
                    );
    }
}