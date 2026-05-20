<?php

/**
 * One-shot converter: parse the three OnePrice reference SQL dumps shipped by
 * the vendor (in the sibling `JDM One price Api/` folder) into committed JSON
 * lookup files under `backend/database/data/oneprice/`.
 *
 * Usage (from repo root):
 *   php backend/scripts/build-oneprice-lookups.php
 *
 * Override the dump dir:
 *   php backend/scripts/build-oneprice-lookups.php "/path/to/JDM One price Api"
 *
 * Idempotent — safe to re-run when the vendor updates the dumps.
 */

$dumpDir = $argv[1] ?? realpath(__DIR__.'/../../JDM One price Api');
if (! $dumpDir || ! is_dir($dumpDir)) {
    fwrite(STDERR, "Dump directory not found: ".($argv[1] ?? '<default>')."\n");
    exit(1);
}

$outDir = __DIR__.'/../database/data/oneprice';
if (! is_dir($outDir) && ! mkdir($outDir, 0755, true)) {
    fwrite(STDERR, "Could not create output dir: {$outDir}\n");
    exit(1);
}

/**
 * Pull the body of the INSERT INTO `<table>` VALUES (...),(...) ; statement.
 *
 * @return list<string> Raw tuple bodies (without the surrounding parens).
 */
function extractTuples(string $sql, string $table): array
{
    if (! preg_match('/INSERT INTO `'.preg_quote($table, '/').'` VALUES (.+?);/s', $sql, $m)) {
        throw new RuntimeException("INSERT INTO `{$table}` not found.");
    }

    // Split on `),(`  — values in these dumps contain no nested parens, so this is safe.
    $body = trim($m[1]);
    $body = preg_replace('/^\(|\)$/', '', $body);

    return preg_split('/\),\(/', $body) ?: [];
}

/** Parse a single CSV-of-SQL-values row into a PHP array. Strings are single-quoted. */
function parseRow(string $row): array
{
    $out = [];
    $i = 0;
    $len = strlen($row);
    while ($i < $len) {
        if ($row[$i] === "'") {
            $j = $i + 1;
            $buf = '';
            while ($j < $len) {
                if ($row[$j] === '\\' && $j + 1 < $len) {
                    $buf .= $row[$j + 1];
                    $j += 2;
                    continue;
                }
                if ($row[$j] === "'") {
                    if ($j + 1 < $len && $row[$j + 1] === "'") {
                        $buf .= "'";
                        $j += 2;
                        continue;
                    }
                    break;
                }
                $buf .= $row[$j];
                $j++;
            }
            $out[] = $buf;
            $i = $j + 1;
            if ($i < $len && $row[$i] === ',') {
                $i++;
            }
            continue;
        }

        $j = $i;
        while ($j < $len && $row[$j] !== ',') {
            $j++;
        }
        $token = trim(substr($row, $i, $j - $i));
        if ($token === 'NULL' || $token === '') {
            $out[] = null;
        } elseif (is_numeric($token)) {
            $out[] = str_contains($token, '.') ? (float) $token : (int) $token;
        } else {
            $out[] = $token;
        }
        $i = $j + 1;
    }

    return $out;
}

$files = [
    'maker' => [
        'sql' => $dumpDir.DIRECTORY_SEPARATOR.'maker_table_dump.sql',
        'out' => $outDir.'/makers.json',
        'columns' => ['company_id', 'country', 'name', 'serial'],
    ],
    'car_model' => [
        'sql' => $dumpDir.DIRECTORY_SEPARATOR.'car_mode_table_dump.sql',
        'out' => $outDir.'/car-models.json',
        'columns' => ['id', 'company_ref', 'model_name_en', 'model_name_ref'],
    ],
    'chassis_code' => [
        'sql' => $dumpDir.DIRECTORY_SEPARATOR.'chassis_code_table_dump.sql',
        'out' => $outDir.'/chassis-codes.json',
        'columns' => ['id', 'model_name_ref', 'model_type_en'],
    ],
];

foreach ($files as $table => $spec) {
    if (! is_readable($spec['sql'])) {
        fwrite(STDERR, "Cannot read {$spec['sql']}\n");
        exit(1);
    }

    $sql = file_get_contents($spec['sql']);
    $rows = [];
    foreach (extractTuples($sql, $table) as $raw) {
        $values = parseRow($raw);
        if (count($values) !== count($spec['columns'])) {
            fwrite(STDERR, "Row column-count mismatch in {$table}: ".json_encode($values)."\n");
            exit(1);
        }
        $rows[] = array_combine($spec['columns'], $values);
    }

    file_put_contents($spec['out'], json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)."\n");
    echo str_pad($table, 15)." → {$spec['out']} (".count($rows)." rows)\n";
}

echo "Done.\n";
