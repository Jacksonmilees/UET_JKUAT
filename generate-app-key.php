<?php
// Simple script to generate Laravel APP_KEY
// Usage: php generate-app-key.php

$key = base64_encode(random_bytes(32));
echo "base64:" . $key . "\n";
echo "\nCopy this key and set it as APP_KEY in Heroku Dashboard\n";

