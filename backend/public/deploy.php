<?php
/**
 * Webhook deployment script for pull-based deploy on shared hosting.
 * To secure this, add DEPLOY_TOKEN=your_secure_random_string to backend/.env
 * And call this via https://api.destinocojp.com/deploy.php?token=your_secure_random_string
 */

// Maximize execution time for long processes like npm build
set_time_limit(300);
ini_set('max_execution_time', 300);

// Basic auth using the backend/.env file
$envPath = __DIR__ . '/../.env';
$token = 'unconfigured';
if (file_exists($envPath)) {
    $envContent = file_get_contents($envPath);
    if (preg_match('/^DEPLOY_TOKEN=(.*)$/m', $envContent, $matches)) {
        $token = trim($matches[1]);
    }
}

if (!isset($_GET['token']) || !hash_equals($token, $_GET['token'])) {
    http_response_code(403);
    die("Forbidden. Invalid or missing token.");
}

// Ensure output is streamed
header('Content-Type: text/plain');
ob_implicit_flush(true);

echo "Starting deployment...\n";

// Hostinger shared hosting environment typical paths
$appDir = realpath(__DIR__ . '/../../'); 
$apexDocroot = realpath($appDir . '/../');
$homeDir = realpath($apexDocroot . '/../../../'); // usually /home/uXXXXXXX

// Help shell_exec find PHP, Composer, and Node/NPM
putenv("HOME=$homeDir");
putenv("COMPOSER_HOME=$homeDir/.composer");
// NVM sets Node on different paths based on the hostinger server. Add common ones to PATH
putenv('PATH=' . $homeDir . '/.nvm/versions/node/current/bin:' . $homeDir . '/.nvm/versions/node/$(nvm current)/bin:/usr/local/bin:/usr/bin:/bin:' . getenv('PATH'));

$commands = [
    "echo '==> Pulling latest main'",
    "cd $appDir && git fetch --depth=1 origin main 2>&1",
    "cd $appDir && git reset --hard origin/main 2>&1",
    
    "echo '==> Installing backend dependencies'",
    // Composer now knows whereHOME is so it won't crash
    "cd $appDir/backend && composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist 2>&1",
    
    "echo '==> Running migrations & clearing caches'",
    "cd $appDir/backend && php artisan migrate --force 2>&1",
    "cd $appDir/backend && php artisan config:clear 2>&1",
    "cd $appDir/backend && php artisan config:cache 2>&1",
    "cd $appDir/backend && php artisan route:clear 2>&1",
    "cd $appDir/backend && php artisan route:cache 2>&1",
    "cd $appDir/backend && php artisan view:clear 2>&1",
    "cd $appDir/backend && php artisan view:cache 2>&1"
];

foreach ($commands as $command) {
    echo "$command\n";
    // We already appened 2>&1 so we can just execute
    $output = shell_exec($command);
    echo $output . "\n";
}

echo "Deployment finished!\n";
