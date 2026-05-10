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

// Help shell_exec find PHP, Composer, git, etc. PHP-FPM's default PATH is
// often minimal, so we extend it with the standard system locations plus
// a couple of nvm guesses for Node (used only if the script ever shells
// out to npm — currently it doesn't, but harmless to include).
putenv("HOME=$homeDir");
putenv("COMPOSER_HOME=$homeDir/.composer");
putenv('PATH=' . implode(':', [
    "$homeDir/.nvm/versions/node/default/bin",  // nvm default alias if set
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    getenv('PATH') ?: '',
]));

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
    "cd $appDir/backend && php artisan view:cache 2>&1",

    "echo '==> Deploying UI build artifacts'",
    // Fetch the ui-build branch (which contains strictly the compiled dist contents)
    "cd $appDir && git fetch --depth=1 origin ui-build 2>&1",
    // Clean stale build artifacts from the apex docroot before extracting the
    // new ones. Without this, old hashed bundles (assets/index-OLDHASH.css)
    // accumulate forever because tar doesn't delete files that aren't in the
    // archive. We preserve api.destinocojp.com/ (the API subdomain folder)
    // and .well-known/ (Let's Encrypt ACME challenges).
    "echo '==> Cleaning previous build from ' " . escapeshellarg($apexDocroot),
    "find " . escapeshellarg($apexDocroot) . " -mindepth 1 -maxdepth 1 "
        . "! -name 'api.destinocojp.com' "
        . "! -name '.well-known' "
        . "-exec rm -rf {} + 2>&1",
    "echo '==> Extracting frontend into ' " . escapeshellarg($apexDocroot),
    "cd $appDir && git archive origin/ui-build | tar -x -C " . escapeshellarg($apexDocroot) . " 2>&1",
];

foreach ($commands as $command) {
    echo "$command\n";
    // We already appened 2>&1 so we can just execute
    $output = shell_exec($command);
    echo $output . "\n";
}

echo "Deployment finished!\n";
