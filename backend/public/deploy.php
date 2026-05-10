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

// Help shell_exec find PHP, Composer, and Node/NPM
putenv('PATH=/usr/local/bin:/usr/bin:/bin:' . getenv('PATH'));

$commands = [
    "echo '==> Pulling latest main'",
    "cd $appDir && git fetch --depth=1 origin main",
    "cd $appDir && git reset --hard origin/main",
    
    "echo '==> Installing backend dependencies'",
    "cd $appDir/backend && composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist",
    
    "echo '==> Running migrations & clearing caches'",
    "cd $appDir/backend && php artisan migrate --force",
    "cd $appDir/backend && php artisan config:clear",
    "cd $appDir/backend && php artisan config:cache",
    "cd $appDir/backend && php artisan route:clear",
    "cd $appDir/backend && php artisan route:cache",
    "cd $appDir/backend && php artisan view:clear",
    "cd $appDir/backend && php artisan view:cache",

    "echo '==> Installing frontend dependencies (if npm is available)'",
    "cd $appDir && if command -v npm >/dev/null 2>&1; then npm ci --no-audit --no-fund; else echo 'NPM not found'; fi",
    
    "echo '==> Building frontend'",
    "cd $appDir && if command -v npm >/dev/null 2>&1; then npm run build; fi",

    "echo '==> Publishing frontend artifacts'",
    "cd $appDir && if [ -d \"dist\" ]; then cp -rf dist/. $apexDocroot/; else echo 'No dist folder found'; fi"
];

foreach ($commands as $command) {
    echo "$command\n";
    $output = shell_exec($command . ' 2>&1');
    echo $output . "\n";
}

echo "Deployment finished!\n";
