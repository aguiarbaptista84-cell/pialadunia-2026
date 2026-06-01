<?php
/* ============================================================
   Konfigurasi koneksi database MySQL (idcloudhost / cPanel)
   ------------------------------------------------------------
   Isi nilai di bawah sesuai database yang Anda buat di panel
   idcloudhost (Databases / MySQL). Lalu unggah file ini bersama
   api.php & index.html ke folder public_html.
   ============================================================ */

define('DB_HOST', 'localhost');     // biasanya 'localhost' di idcloudhost
define('DB_NAME', 'NAMA_DATABASE'); // ganti: nama database Anda
define('DB_USER', 'USER_DATABASE'); // ganti: user database Anda
define('DB_PASS', 'PASSWORD_DB');   // ganti: password database Anda
define('DB_PORT', 3306);            // umumnya 3306
