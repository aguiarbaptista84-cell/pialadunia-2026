<?php
/* ============================================================
   API Backend — Dashboard Piala Dunia 2026
   PHP + MySQL. Semua request berupa POST JSON ke api.php.
   Body: { action, auth:{username,password}, ...data }
   ============================================================ */

require __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

const POIN_BENAR  = 10;
const TOTAL_MATCHES = 72;

function out($d){ echo json_encode($d); exit; }
function fail($msg, $code = 400){ http_response_code($code); echo json_encode(['error' => $msg]); exit; }

/* ---------- Koneksi DB ---------- */
$db = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
if ($db->connect_errno) fail('Koneksi database gagal: ' . $db->connect_error, 500);
$db->set_charset('utf8mb4');

/* ---------- Pastikan tabel ada ---------- */
$db->query("CREATE TABLE IF NOT EXISTS users (
  username VARCHAR(50) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password VARCHAR(100) NOT NULL,
  submitted TINYINT(1) NOT NULL DEFAULT 0,
  submitted_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$db->query("CREATE TABLE IF NOT EXISTS predictions (
  username VARCHAR(50) NOT NULL,
  mkey VARCHAR(12) NOT NULL,
  res VARCHAR(5) NOT NULL,
  PRIMARY KEY (username, mkey)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$db->query("CREATE TABLE IF NOT EXISTS official (
  mkey VARCHAR(12) PRIMARY KEY,
  res VARCHAR(5) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$db->query("CREATE TABLE IF NOT EXISTS config (
  k VARCHAR(40) PRIMARY KEY,
  v VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
$db->query("INSERT IGNORE INTO config (k,v) VALUES ('open','1'),('adminPass','admin123')");

/* ---------- Helper config ---------- */
function cfg($db, $k){
  $stmt = $db->prepare("SELECT v FROM config WHERE k=?");
  $stmt->bind_param('s', $k); $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  return $row ? $row['v'] : null;
}
function setcfg($db, $k, $v){
  $stmt = $db->prepare("INSERT INTO config (k,v) VALUES (?,?) ON DUPLICATE KEY UPDATE v=VALUES(v)");
  $stmt->bind_param('ss', $k, $v); $stmt->execute();
}

/* ---------- Autentikasi ---------- */
function authRole($db, $auth){
  if (!is_array($auth) || !isset($auth['username'], $auth['password'])) return null;
  $u = trim($auth['username']); $p = (string)$auth['password'];
  if (strtolower($u) === 'admin' && $p === cfg($db, 'adminPass')) {
    return ['role' => 'admin', 'username' => 'admin'];
  }
  $stmt = $db->prepare("SELECT username, password FROM users WHERE LOWER(username)=LOWER(?)");
  $stmt->bind_param('s', $u); $stmt->execute();
  $row = $stmt->get_result()->fetch_assoc();
  if ($row && $row['password'] === $p) return ['role' => 'peserta', 'username' => $row['username']];
  return null;
}

/* ---------- Papan skor (skor dihitung di server) ---------- */
function buildLeaderboard($db){
  $off = [];
  $r = $db->query("SELECT mkey,res FROM official");
  while ($x = $r->fetch_assoc()) $off[$x['mkey']] = $x['res'];

  $users = [];
  $r = $db->query("SELECT username,name,phone,submitted,submitted_at FROM users");
  while ($u = $r->fetch_assoc()) {
    $users[$u['username']] = [
      'name' => $u['name'], 'phone' => $u['phone'], 'username' => $u['username'],
      'submitted' => (int)$u['submitted'], 'submittedAt' => $u['submitted_at'],
      'score' => 0, 'correct' => 0, 'judged' => 0,
    ];
  }
  $r = $db->query("SELECT username,mkey,res FROM predictions");
  while ($p = $r->fetch_assoc()) {
    if (!isset($users[$p['username']]) || !isset($off[$p['mkey']])) continue;
    $users[$p['username']]['judged']++;
    if ($off[$p['mkey']] === $p['res']) {
      $users[$p['username']]['correct']++;
      $users[$p['username']]['score'] += POIN_BENAR;
    }
  }
  $arr = array_values($users);
  usort($arr, function($a, $b){
    if ($b['score'] !== $a['score']) return $b['score'] - $a['score'];
    if ($b['correct'] !== $a['correct']) return $b['correct'] - $a['correct'];
    return strcmp($a['name'], $b['name']);
  });
  return $arr;
}

function validKey($k){ return is_string($k) && preg_match('/^[A-L]-[0-5]$/', $k); }
function validRes($r){ return in_array($r, ['home', 'draw', 'away'], true); }

/* ---------- Baca request ---------- */
$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) $body = [];
$action = $body['action'] ?? ($_GET['action'] ?? '');
$auth   = $body['auth'] ?? null;

/* ---------- LOGIN ---------- */
if ($action === 'login') {
  $role = authRole($db, $auth);
  if (!$role) fail('Username atau password salah.', 401);
  out(['ok' => true, 'role' => $role['role'], 'username' => $role['username']]);
}

/* ---------- Selain login: wajib terautentikasi ---------- */
$me = authRole($db, $auth);
if (!$me) fail('Sesi tidak valid. Silakan login ulang.', 401);

/* ---------- GET STATE ---------- */
if ($action === 'getState') {
  $off = [];
  $r = $db->query("SELECT mkey,res FROM official");
  while ($x = $r->fetch_assoc()) $off[$x['mkey']] = $x['res'];

  $resp = [
    'open' => cfg($db, 'open') === '1',
    'official' => (object)$off,
    'leaderboard' => buildLeaderboard($db),
  ];

  if ($me['role'] === 'admin') {
    $cnt = [];
    $r = $db->query("SELECT username, COUNT(*) c FROM predictions GROUP BY username");
    while ($x = $r->fetch_assoc()) $cnt[$x['username']] = (int)$x['c'];
    $users = [];
    $r = $db->query("SELECT username,name,phone,password,submitted,submitted_at FROM users ORDER BY name");
    while ($u = $r->fetch_assoc()) {
      $users[] = [
        'username' => $u['username'], 'name' => $u['name'], 'phone' => $u['phone'],
        'password' => $u['password'], 'submitted' => (int)$u['submitted'],
        'submittedAt' => $u['submitted_at'], 'filled' => $cnt[$u['username']] ?? 0,
      ];
    }
    $resp['users'] = $users;
  } else {
    $preds = [];
    $stmt = $db->prepare("SELECT mkey,res FROM predictions WHERE username=?");
    $stmt->bind_param('s', $me['username']); $stmt->execute();
    $rr = $stmt->get_result();
    while ($x = $rr->fetch_assoc()) $preds[$x['mkey']] = $x['res'];

    $stmt = $db->prepare("SELECT name,phone,username,submitted,submitted_at FROM users WHERE username=?");
    $stmt->bind_param('s', $me['username']); $stmt->execute();
    $info = $stmt->get_result()->fetch_assoc();
    $resp['me'] = [
      'name' => $info['name'], 'phone' => $info['phone'], 'username' => $info['username'],
      'submitted' => (int)$info['submitted'], 'submittedAt' => $info['submitted_at'],
      'predictions' => (object)$preds,
    ];
  }
  out($resp);
}

/* ---------- SIMPAN TEBAKAN (peserta) ---------- */
if ($action === 'savePrediction') {
  if ($me['role'] !== 'peserta') fail('Hanya peserta.', 403);
  if (cfg($db, 'open') !== '1') fail('Input ditutup oleh admin.', 403);
  $stmt = $db->prepare("SELECT submitted FROM users WHERE username=?");
  $stmt->bind_param('s', $me['username']); $stmt->execute();
  $sub = $stmt->get_result()->fetch_assoc();
  if ($sub && (int)$sub['submitted'] === 1) fail('Tebakan sudah dikunci.', 403);

  $key = $body['key'] ?? ''; $res = $body['res'] ?? null;
  if (!validKey($key)) fail('Laga tidak valid.');
  if ($res === null) {
    $stmt = $db->prepare("DELETE FROM predictions WHERE username=? AND mkey=?");
    $stmt->bind_param('ss', $me['username'], $key); $stmt->execute();
  } else {
    if (!validRes($res)) fail('Hasil tidak valid.');
    $stmt = $db->prepare("INSERT INTO predictions (username,mkey,res) VALUES (?,?,?) ON DUPLICATE KEY UPDATE res=VALUES(res)");
    $stmt->bind_param('sss', $me['username'], $key, $res); $stmt->execute();
  }
  out(['ok' => true]);
}

/* ---------- RESET TEBACAN SAYA (peserta) ---------- */
if ($action === 'resetMine') {
  if ($me['role'] !== 'peserta') fail('Hanya peserta.', 403);
  if (cfg($db, 'open') !== '1') fail('Input ditutup.', 403);
  $stmt = $db->prepare("SELECT submitted FROM users WHERE username=?");
  $stmt->bind_param('s', $me['username']); $stmt->execute();
  $sub = $stmt->get_result()->fetch_assoc();
  if ($sub && (int)$sub['submitted'] === 1) fail('Tebakan sudah dikunci.', 403);
  $stmt = $db->prepare("DELETE FROM predictions WHERE username=?");
  $stmt->bind_param('s', $me['username']); $stmt->execute();
  out(['ok' => true]);
}

/* ---------- SUBMIT / KUNCI (peserta) ---------- */
if ($action === 'submit') {
  if ($me['role'] !== 'peserta') fail('Hanya peserta.', 403);
  if (cfg($db, 'open') !== '1') fail('Input ditutup oleh admin.', 403);
  $stmt = $db->prepare("SELECT COUNT(*) c FROM predictions WHERE username=?");
  $stmt->bind_param('s', $me['username']); $stmt->execute();
  $c = (int)$stmt->get_result()->fetch_assoc()['c'];
  if ($c < TOTAL_MATCHES) fail('Harus memilih semua ' . TOTAL_MATCHES . ' laga. Baru terisi ' . $c . '.');
  $stmt = $db->prepare("UPDATE users SET submitted=1, submitted_at=NOW() WHERE username=?");
  $stmt->bind_param('s', $me['username']); $stmt->execute();
  out(['ok' => true]);
}

/* ---------- LIHAT TEBAKAN PESERTA (admin: siapa saja; peserta: diri sendiri) ---------- */
if ($action === 'getPredictions') {
  // Semua peserta yang sudah login boleh melihat tebakan peserta lain.
  $target = trim($body['username'] ?? '');
  $preds = [];
  $stmt = $db->prepare("SELECT mkey,res FROM predictions WHERE username=?");
  $stmt->bind_param('s', $target); $stmt->execute();
  $rr = $stmt->get_result();
  while ($x = $rr->fetch_assoc()) $preds[$x['mkey']] = $x['res'];
  $stmt = $db->prepare("SELECT name FROM users WHERE username=?");
  $stmt->bind_param('s', $target); $stmt->execute();
  $u = $stmt->get_result()->fetch_assoc();
  out(['predictions' => (object)$preds, 'name' => $u['name'] ?? $target, 'username' => $target]);
}

/* ================= AKSI ADMIN ================= */
if ($me['role'] !== 'admin') fail('Hanya admin yang boleh aksi ini.', 403);

if ($action === 'setOfficial') {
  $key = $body['key'] ?? ''; $res = $body['res'] ?? null;
  if (!validKey($key)) fail('Laga tidak valid.');
  if ($res === null) {
    $stmt = $db->prepare("DELETE FROM official WHERE mkey=?");
    $stmt->bind_param('s', $key); $stmt->execute();
  } else {
    if (!validRes($res)) fail('Hasil tidak valid.');
    $stmt = $db->prepare("INSERT INTO official (mkey,res) VALUES (?,?) ON DUPLICATE KEY UPDATE res=VALUES(res)");
    $stmt->bind_param('ss', $key, $res); $stmt->execute();
  }
  out(['ok' => true]);
}

if ($action === 'toggleOpen') {
  setcfg($db, 'open', !empty($body['open']) ? '1' : '0');
  out(['ok' => true]);
}

if ($action === 'registerUser') {
  $name = trim($body['name'] ?? '');
  $phone = preg_replace('/[^0-9+]/', '', $body['phone'] ?? '');
  $username = trim($body['username'] ?? '');
  $password = trim($body['password'] ?? '');
  if (strlen($name) < 2) fail('Nama minimal 2 karakter.');
  if (strlen($phone) < 6) fail('No. TLP tidak valid.');
  if (strlen($username) < 3) fail('Username minimal 3 karakter.');
  if (strlen($password) < 4) fail('Password minimal 4 karakter.');
  if (strtolower($username) === 'admin') fail('Username itu khusus admin.');
  $stmt = $db->prepare("SELECT 1 FROM users WHERE LOWER(username)=LOWER(?)");
  $stmt->bind_param('s', $username); $stmt->execute();
  if ($stmt->get_result()->fetch_row()) fail('Username sudah dipakai.');
  $stmt = $db->prepare("SELECT 1 FROM users WHERE phone=?");
  $stmt->bind_param('s', $phone); $stmt->execute();
  if ($stmt->get_result()->fetch_row()) fail('No. TLP sudah terdaftar.');
  $stmt = $db->prepare("INSERT INTO users (username,name,phone,password) VALUES (?,?,?,?)");
  $stmt->bind_param('ssss', $username, $name, $phone, $password); $stmt->execute();
  out(['ok' => true]);
}

if ($action === 'deleteUser') {
  $username = trim($body['username'] ?? '');
  $stmt = $db->prepare("DELETE FROM predictions WHERE username=?");
  $stmt->bind_param('s', $username); $stmt->execute();
  $stmt = $db->prepare("DELETE FROM users WHERE username=?");
  $stmt->bind_param('s', $username); $stmt->execute();
  out(['ok' => true]);
}

if ($action === 'resetPassword') {
  $username = trim($body['username'] ?? '');
  $password = trim($body['password'] ?? '');
  if (strlen($password) < 4) fail('Password minimal 4 karakter.');
  $stmt = $db->prepare("UPDATE users SET password=? WHERE username=?");
  $stmt->bind_param('ss', $password, $username); $stmt->execute();
  out(['ok' => true]);
}

if ($action === 'unlock') {
  $username = trim($body['username'] ?? '');
  $stmt = $db->prepare("UPDATE users SET submitted=0, submitted_at=NULL WHERE username=?");
  $stmt->bind_param('s', $username); $stmt->execute();
  out(['ok' => true]);
}

if ($action === 'changeAdminPassword') {
  $password = trim($body['password'] ?? '');
  if (strlen($password) < 4) fail('Password minimal 4 karakter.');
  setcfg($db, 'adminPass', $password);
  out(['ok' => true]);
}

fail('Aksi tidak dikenal: ' . $action, 404);
