# 📡 OpenWrt Monitoring Bot

Bot WhatsApp yang membantu Anda memantau kondisi sistem OpenWrt secara real-time, seperti status koneksi, penggunaan memori, suhu CPU, trafik jaringan, dan lainnya — langsung dari WhatsApp!

---

## 🚀 Fitur Utama

- Monitoring performa OpenWrt dari jarak jauh
- Statistik jaringan berbasis `vnStat`
- Pengecekan status koneksi internet
- Dukungan pesan otomatis & notifikasi
- Bisa dikembangkan untuk kendali jarak jauh (ADB, script, dll)

---

## 🛠️ Cara Penggunaan

### ✅ Persiapan

Pastikan OpenWrt Anda sudah memiliki `nodejs`.

```sh
opkg update && opkg install nodejs
```

### 📥 Langkah Pertama: Clone Repositori

```sh
git clone https://github.com/ravatz/OpenWrt-Monitoring-Bot.git
cd OpenWrtBot
```

### ⚙️ Langkah Kedua: Salin File Config

```sh
mv ./config/config.js.example ./config/config.js
mv ./config/setting.json.example ./config/setting.json
```

### ✏️ Langkah Ketiga: Sesuaikan `config.js`

Edit file `config.js` sesuai kebutuhan Anda, seperti:

- Nomor admin & owner
- Port API & password clash

### 📦 Langkah Keempat: Install Dependency

```sh
npm i
```

### 🟢 Langkah Terakhir: Jalankan Bot

```sh
npm run start
```

---

## 🧪 Contoh Perintah (dalam WhatsApp)

- `menu` → Menampilkan semua menu
- `info` → Menampilkan informasi sistem (CPU, memori, uptime, IP, dsb)
- `vnstati -i eth0 -s -d` → Kirim grafik trafik jaringan berdasarkan opsi
- `speedtest` → Jalankan speedtest dan kirim hasilnya
- `cmd <command>` → Jalankan perintah shell secara remote (khusus admin)

---

## 📌 Catatan

- Bot ini berbasis [Baileys](https://github.com/adiwajshing/Baileys) dan berjalan secara lokal di OpenWrt.
- Pastikan penyimpanan cukup & tidak overload CPU jika dijalankan terus-menerus.

