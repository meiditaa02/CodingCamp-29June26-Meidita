# Daybook — To-Do List Life Dashboard

Dashboard sederhana untuk membantu mengatur hari-harimu, dibuat sebagai bagian dari project RevoU Coding Camp. Menampilkan jam dan tanggal saat ini, sapaan personal, fokus timer ala Pomodoro, to-do list, dan quick links ke website favorit. Semua data tersimpan langsung di browser (Local Storage) tanpa server.

## Fitur

- **Greeting** — jam real-time, tanggal, dan sapaan yang berubah sesuai waktu (pagi/siang/sore/malam)
- **Focus Timer** — timer 25 menit (bisa diubah), lengkap dengan tombol Start / Stop / Reset
- **To-Do List** — tambah, edit (klik langsung teksnya), tandai selesai, dan hapus task
- **Quick Links** — simpan shortcut ke website favorit

## Challenge yang dikerjakan (3 dari 5)

- ✅ Custom name di greeting — klik "Set your name"
- ✅ Ubah durasi Pomodoro — klik ikon ⚙ di kartu timer
- ✅ Cegah task duplikat — task dengan nama yang sama saat tambah atau edit akan ditolak

## Tech stack

- HTML5
- CSS3 (satu file, `css/style.css`)
- Vanilla JavaScript (satu file, `js/script.js`)
- Browser `localStorage` untuk semua data tanpa backend dan framework

## Struktur project

```
├── index.html
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Menjalankan secara lokal

Buka `index.html` di browser (Chrome, Firefox, Edge, atau Safari). Tidak perlu build step atau server.

Dibuat dengan 🖤 oleh Meidita — RevoU Coding Camp, Juni 2026