<?php
// app/Exceptions/TransactionFailedException.php
namespace App\Exceptions;

use Exception;

class TransactionFailedException extends Exception
{
    public function render($request)
    {
        return response()->json([
            'status' => 'error',
            'message' => $this->getMessage() ?: 'Transaction failed'
        ], 400);
    }
}
