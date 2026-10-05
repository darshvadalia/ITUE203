<?php
// Receives the Practical 7 form. Validation is always performed on the server.
declare(strict_types=1);

function respond(int $status, bool $success, string $message, array $errors = []): void
{
    http_response_code($status);
    header('Cache-Control: no-store');
    if (strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => $success, 'message' => $message, 'errors' => $errors]);
    } else {
        // Supports ordinary form submission when JavaScript is disabled.
        header('Content-Type: text/html; charset=utf-8');
        $escape = function (string $value): string {
            return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        };
        echo '<!DOCTYPE html><html lang="en"><meta charset="UTF-8"><title>Registration result</title>';
        echo '<h1>' . ($success ? 'Registration successful' : 'Registration error') . '</h1>';
        echo '<p>' . $escape($message) . '</p><ul>';
        foreach ($errors as $error) {
            echo '<li>' . $escape($error) . '</li>';
        }
        echo '</ul><p><a href="Practical_7.html">Return to the registration form</a></p></html>';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Please submit the registration form using POST.');
}

// Reject array-shaped fields and oversized inputs before sanitizing.
function input(string $field, int $maximumBytes, array &$errors): string
{
    $value = $_POST[$field] ?? '';
    if (!is_string($value) || strlen($value) > $maximumBytes || preg_match('//u', $value) !== 1) {
        $errors[$field] = 'Invalid or oversized input for ' . $field . '.';
        return '';
    }
    return trim($value);
}

$errors = [];
$name = input('name', 400, $errors);
$email = input('email', 254, $errors);
$phone = input('phone', 10, $errors);
$course = input('course', 20, $errors);
$message = input('message', 4000, $errors);
$terms = input('terms', 1, $errors);

// Normalize names, and remove markup/control characters from free-form text.
$name = trim(preg_replace('/\s+/u', ' ', strip_tags($name)));
$message = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', strip_tags($message)));
if (preg_match("/^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,99}$/u", $name) !== 1) {
    $errors['name'] = 'Enter a name of 2–100 characters using letters, spaces, periods, apostrophes or hyphens.';
}
if (filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    $errors['email'] = 'Enter a valid email address.';
}
if (preg_match('/^[0-9]{10}$/', $phone) !== 1) {
    $errors['phone'] = 'Enter a mobile number containing exactly 10 digits.';
}
if (!in_array($course, ['BCA', 'BBA', 'BTech', 'MCA'], true)) {
    $errors['course'] = 'Select a valid course.';
}
if (preg_match('/^.{0,1000}$/us', $message) !== 1) {
    $errors['message'] = 'The message must contain at most 1000 characters.';
}
if ($terms !== '1') {
    $errors['terms'] = 'Please accept the terms and conditions.';
}
if ($errors) {
    respond(422, false, 'Please correct the following errors.', $errors);
}

// Lock the entire read/modify/write operation so simultaneous submissions
// cannot overwrite each other's records. Never replace malformed stored JSON.
$file = @fopen(__DIR__ . '/practical_7_records.json', 'c+');
if ($file === false) {
    respond(500, false, 'Unable to save your registration. Please try again later.');
}
$locked = false;
try {
    if (!flock($file, LOCK_EX)) {
        throw new RuntimeException('Could not lock the storage file.');
    }
    $locked = true;
    $contents = stream_get_contents($file);
    if ($contents === false) {
        throw new RuntimeException('Could not read the storage file.');
    }
    $records = trim($contents) === '' ? [] : json_decode($contents, true);
    if (!is_array($records) || (trim($contents) !== '' &&
        (json_last_error() !== JSON_ERROR_NONE || substr(ltrim($contents), 0, 1) !== '['))) {
        throw new RuntimeException('Stored records are not a valid JSON array.');
    }
    $records[] = [
        'id' => bin2hex(random_bytes(8)),
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'course' => $course,
        'message' => $message,
        'terms_accepted' => true,
        'submitted_at' => gmdate('c')
    ];
    $json = json_encode($records, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($json === false || !rewind($file)) {
        throw new RuntimeException('Could not encode the records.');
    }
    $offset = 0;
    while ($offset < strlen($json)) {
        $written = fwrite($file, substr($json, $offset));
        if ($written === false || $written === 0) {
            throw new RuntimeException('Could not write the records.');
        }
        $offset += $written;
    }
    if (!ftruncate($file, strlen($json)) || !fflush($file)) {
        throw new RuntimeException('Could not finish saving the records.');
    }
} catch (Throwable $error) {
    error_log('Practical 7 storage error: ' . $error->getMessage());
    if ($locked) {
        flock($file, LOCK_UN);
    }
    fclose($file);
    respond(500, false, 'Unable to save your registration. Please try again later.');
}
flock($file, LOCK_UN);
fclose($file);
respond(201, true, 'Registration successful! Your record has been saved.');
