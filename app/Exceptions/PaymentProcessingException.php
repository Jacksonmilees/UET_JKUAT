<?php

namespace App\Exceptions;

class PaymentProcessingException extends \Exception
{
    // Custom exception for payment processing errors
    public function __construct($message = "", $code = 0, \Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}