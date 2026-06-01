# Panduan Deploy — Dashboard Piala Dunia 2026

Aplikasi ini kini terdiri dari **frontend** (HTML/CSS/JS) + **backend PHP + MySQL** (`api.php`),
sehingga **bisa diakses banyak peserta dari perangkat berbeda** (data tersimpan di server).

## Berkas

| Berkas | Fungsi |
|--------|--------|
| `index.html`, `style.css`, `app.js` | Tampilan & logika (frontend) |
| `api.php` | Backend API (PHP) — semua data lewat sini |
| `config.php` | Pengaturan koneksi database (WAJIB diisi) |
| `PANDUAN-DEPLOY.md` | Dokumen ini |

> Tabel database **dibuat otomatis** saat `api.php` pertama kali diakses — Anda tidak perlu impor SQL manual.

---

## A. Simpan kode ke GitHub

```bash
git init
git add .
git commit -m "Dashboard Piala Dunia 2026"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

> **Penting:** jangan menulis password database asli di `config.php` yang Anda push ke GitHub.
> Biarkan `config.php` berisi placeholder, lalu isi nilai aslinya **langsung di server idcloudhost**
> (lihat langkah B-3). Atau tambahkan `config.php` ke `.gitignore`.

---

## B. Hosting di idcloudhost (PHP + MySQL)

Cara termudah: **taruh frontend + backend di idcloudhost** (satu domain), supaya tidak ada masalah CORS.

### 1. Buat database MySQL
- Masuk panel idcloudhost → **Databases / MySQL**.
- Buat database baru, mis. `wc2026`.
- Buat user database + password, lalu **beri akses** user itu ke database.
- Catat: **nama database, user, password, host** (umumnya `localhost`).

### 2. Unggah berkas
- Buka **File Manager** → folder `public_html` (atau subfolder, mis. `public_html/bola`).
- Unggah semua berkas: `index.html`, `style.css`, `app.js`, `api.php`, `config.php`.

### 3. Isi `config.php` di server
Edit `config.php` (klik kanan → Edit di File Manager), isi sesuai langkah B-1:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'wc2026');          // nama database Anda
define('DB_USER', 'wc2026_user');     // user database Anda
define('DB_PASS', 'password-rahasia'); // password database Anda
define('DB_PORT', 3306);
```

### 4. Selesai — buka URL
- Akses `https://domain-anda/` (atau `https://domain-anda/bola/`).
- Halaman login akan muncul. Tabel database terbentuk otomatis.

---

## C. Login pertama (Admin)

- **Username:** `admin`
- **Password:** `admin123`

Setelah login admin:
1. Klik **🔑 Ubah Password Admin** untuk mengganti password default (disarankan).
2. Di **➕ Daftarkan Peserta Baru**, isi Nama, No. TLP, Username, Password (atau klik **🎲 Auto**),
   lalu **Daftarkan**. Bagikan username & password ke tiap peserta.
3. Atur **Buka/Tutup Input Peserta** sesuai kebutuhan.
4. Saat pertandingan selesai, klik hasil tiap laga untuk menetapkan **Hasil Resmi** → skor peserta
   terhitung otomatis.

Peserta cukup membuka **URL yang sama** di HP masing-masing dan login dengan username + password mereka.

---

## Catatan

- **Sinkronisasi:** halaman menyegarkan data otomatis tiap ~15 detik, jadi hasil resmi & papan skor
  ter-update di semua perangkat tanpa refresh manual.
- **Frontend di GitHub Pages + API di idcloudhost?** Bisa, tapi buka `app.js` dan ubah
  `const API_URL = "api.php";` menjadi URL penuh, mis. `"https://domain-anda/api.php"`.
  (`api.php` sudah mengirim header CORS sehingga lintas-domain diizinkan.)
- **Keamanan:** password disimpan apa adanya (plaintext) agar admin bisa menyampaikannya ke peserta —
  cukup untuk acara internal. Untuk keamanan lebih, perlu hashing + HTTPS (idcloudhost umumnya sudah HTTPS).
- **Batas pendaftaran** peserta baru: 10 Juni 2026 (diatur di `app.js` → `DEADLINE`).
