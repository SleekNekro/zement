<?php

declare(strict_types=1);

/*
 * Formulario de contacto de Zement para IONOS (PHP 8.2+, cURL y mbstring).
 * Validación en servidor, campo trampa, Turnstile,
 * límite de tamaño y de intentos por IP, y envío con Resend.
 * La configuración privada (zement-contact.php) y el contador viven FUERA de la carpeta pública.
 */

function contactReply(int $status, string $message, array $errors = []): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(
        [
            'success' => $status === 200,
            'message' => $message,
            'errors' => (object) $errors,
        ],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );
    exit;
}

/** Máximo 10 intentos por IP cada 10 minutos (contador en disco con bloqueo exclusivo). */
function contactLimit(string $directory, string $address): int
{
    if (!is_dir($directory) && !mkdir($directory, 0700, true) && !is_dir($directory)) {
        throw new RuntimeException('Counter unavailable');
    }
    $file = fopen($directory . '/attempts.json', 'c+');
    if ($file === false) {
        throw new RuntimeException('Counter unavailable');
    }
    try {
        if (!flock($file, LOCK_EX)) {
            throw new RuntimeException('Counter unavailable');
        }
        $stored = stream_get_contents($file);
        $entries = $stored === '' ? [] : json_decode($stored, true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($entries)) {
            throw new RuntimeException('Invalid counter');
        }
        $now = time();
        $entries = array_filter($entries, fn ($entry) => $entry['expires'] > $now);
        $packed = @inet_pton($address);
        $key = hash('sha256', $packed === false ? 'unknown' : $packed);
        if (!isset($entries[$key]) && count($entries) >= 10000) {
            return 600;
        }
        $entry = $entries[$key] ?? ['attempts' => 0, 'expires' => $now + 600];
        if ($entry['attempts'] >= 10) {
            return max(1, $entry['expires'] - $now);
        }
        $entry['attempts']++;
        $entries[$key] = $entry;
        rewind($file);
        $encoded = json_encode($entries, JSON_THROW_ON_ERROR);
        if (!ftruncate($file, 0) || fwrite($file, $encoded) !== strlen($encoded) || !fflush($file)) {
            throw new RuntimeException('Counter unavailable');
        }
        return 0;
    } finally {
        flock($file, LOCK_UN);
        fclose($file);
    }
}

function contactHttp(string $url, string $body, array $headers): array
{
    $curl = curl_init($url);
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $body,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
        CURLOPT_USERAGENT => 'ZementContact/1.0',
    ]);
    try {
        $response = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        if ($response === false || $status < 200 || $status >= 300) {
            throw new RuntimeException('Provider unavailable');
        }
        $decoded = json_decode($response, true, 32, JSON_THROW_ON_ERROR);
        if (!is_array($decoded)) {
            throw new RuntimeException('Invalid provider response');
        }
        return $decoded;
    } finally {
        curl_close($curl);
    }
}

$messages = json_decode((string) file_get_contents(__DIR__ . '/contact-messages.json'), true);
$lang = 'es';
$t = function (string $key) use (&$lang, $messages): string {
    return $messages[$lang][$key] ?? $messages['es'][$key];
};

$interestLabels = [
    'application' => 'Aplicación del sistema',
    'products' => 'Comprar productos',
    'professional' => 'Alta / información profesional',
    'other' => 'Otro',
];

try {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
        header('Allow: POST');
        contactReply(405, $t('forbidden'));
    }

    $configFile = dirname(__DIR__, 2) . '/zement-contact.php';
    $config = is_file($configFile) ? require $configFile : [];
    if (!is_array($config)) {
        throw new RuntimeException('Invalid configuration');
    }
    $origin = $config['CONTACT_ORIGIN'] ?? '';
    if (!preg_match('~^https?://[^/]+$~D', $origin)) {
        contactReply(503, $t('unavailable'));
    }
    if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] !== $origin) {
        contactReply(403, $t('forbidden'));
    }

    $retry = contactLimit(dirname(__DIR__, 2) . '/zement-contact-state', $_SERVER['REMOTE_ADDR'] ?? '');
    if ($retry > 0) {
        header('Retry-After: ' . $retry);
        contactReply(429, $t('unavailable'));
    }

    // Solo formularios urlencoded (sin subida de archivos), máximo 96 KiB.
    $type = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
    if ($type !== 'application/x-www-form-urlencoded') {
        contactReply(415, $t('forbidden'));
    }
    if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 98304) {
        contactReply(413, $t('invalidFields'));
    }
    $input = fopen('php://input', 'rb');
    $body = stream_get_contents($input, 98305);
    fclose($input);
    if ($body === false || strlen($body) > 98304) {
        contactReply(413, $t('invalidFields'));
    }
    parse_str($body, $form);

    if (isset($form['lang']) && is_string($form['lang']) && isset($messages[$form['lang']])) {
        $lang = $form['lang'];
    }
    // Campo trampa: los humanos no lo ven ni lo rellenan.
    if (isset($form['website']) && $form['website'] !== '') {
        contactReply(400, $t('forbidden'));
    }

    $errors = [];
    $fields = [];
    foreach (['name', 'email', 'phone', 'interest', 'postalCode', 'area', 'message', 'privacy', 'cf-turnstile-response'] as $key) {
        $value = $form[$key] ?? '';
        if (!is_string($value) || !mb_check_encoding($value, 'UTF-8')) {
            $errors[$key] = [$t('invalidFields')];
            $value = '';
        }
        $fields[$key] = trim($value);
    }

    $nameLength = mb_strlen($fields['name'], 'UTF-8');
    if ($nameLength < 2 || $nameLength > 100) {
        $errors['name'] = [$t('invalidName')];
    }
    if (strlen($fields['email']) > 254 || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = [$t('invalidEmail')];
    }
    if (
        $fields['phone'] !== ''
        && (mb_strlen($fields['phone']) > 30
            || !preg_match('/^[+\d\s().-]*$/uD', $fields['phone'])
            || strlen(preg_replace('/\D/', '', $fields['phone'])) < 5)
    ) {
        $errors['phone'] = [$t('invalidPhone')];
    }
    if (!isset($interestLabels[$fields['interest']])) {
        $errors['interest'] = [$t('invalidFields')];
    }
    if (mb_strlen($fields['postalCode'], 'UTF-8') > 20) {
        $errors['postalCode'] = [$t('invalidFields')];
    }
    if ($fields['area'] !== '' && !preg_match('/^\d{1,6}([.,]\d{1,2})?$/D', $fields['area'])) {
        $errors['area'] = [$t('invalidArea')];
    }
    $messageLength = mb_strlen($fields['message'], 'UTF-8');
    if ($messageLength < 10 || $messageLength > 5000) {
        $errors['message'] = [$t('shortMessage')];
    }
    if ($fields['privacy'] !== 'on') {
        $errors['privacy'] = [$t('privacyRequired')];
    }
    if ($fields['cf-turnstile-response'] === '' || strlen($fields['cf-turnstile-response']) > 2048) {
        $errors['cf-turnstile-response'] = [$t('captchaRequired')];
    }
    if ($errors) {
        contactReply(400, $t('invalidFields'), $errors);
    }

    // Configuración obligatoria para enviar (sin ella: 503 controlado, sin exponer detalles).
    $secret = trim($config['TURNSTILE_SECRET_KEY'] ?? '');
    $public = ($config['ZEMENT_RELEASE_MODE'] ?? 'preview') === 'public';
    $hosts = array_values(array_filter(array_map('trim', explode(',', strtolower($config['TURNSTILE_ALLOWED_HOSTNAMES'] ?? '')))));
    $testSecrets = ['1x0000000000000000000000000000000AA', '2x0000000000000000000000000000000AA', '3x0000000000000000000000000000000AA'];
    if (
        !$secret || empty($config['RESEND_API_KEY']) || empty($config['CONTACT_FROM_EMAIL']) || empty($config['CONTACT_TO_EMAIL'])
        || ($public && (!$hosts || in_array($secret, $testSecrets, true)))
    ) {
        contactReply(503, $t('unavailable'));
    }

    try {
        $token = contactHttp('https://challenges.cloudflare.com/turnstile/v0/siteverify', http_build_query([
            'secret' => $secret,
            'response' => $fields['cf-turnstile-response'],
        ]), ['Content-Type: application/x-www-form-urlencoded']);
    } catch (Throwable $error) {
        contactReply(503, $t('unavailable'));
    }
    if (($token['success'] ?? false) !== true || ($token['action'] ?? '') !== 'contact'
        || (($public || $hosts) && !in_array(strtolower($token['hostname'] ?? ''), $hosts, true))) {
        contactReply(400, $t('verificationExpired'));
    }

    $text = "Interés: {$interestLabels[$fields['interest']]}\n"
        . "Nombre: {$fields['name']}\n"
        . "Email: {$fields['email']}\n"
        . 'Teléfono: ' . ($fields['phone'] ?: 'No indicado') . "\n"
        . 'Código postal de la obra: ' . ($fields['postalCode'] ?: 'No indicado') . "\n"
        . 'Superficie aproximada: ' . ($fields['area'] ? $fields['area'] . ' m²' : 'No indicada') . "\n"
        . "Idioma: {$lang}\n"
        . "Información de privacidad leída: sí\n\n"
        . $fields['message'];

    try {
        $sent = contactHttp('https://api.resend.com/emails', json_encode([
            'from' => $config['CONTACT_FROM_EMAIL'],
            'to' => [$config['CONTACT_TO_EMAIL']],
            'reply_to' => $fields['email'],
            'subject' => 'Web Zement · ' . $interestLabels[$fields['interest']],
            'text' => $text,
        ], JSON_THROW_ON_ERROR), [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $config['RESEND_API_KEY'],
        ]);
        if (!isset($sent['id']) || !is_string($sent['id']) || $sent['id'] === '') {
            contactReply(502, $t('unavailable'));
        }
    } catch (Throwable $error) {
        contactReply(502, $t('unavailable'));
    }

    contactReply(200, $t('success'));
} catch (Throwable $error) {
    contactReply(503, $t('unavailable'));
}
