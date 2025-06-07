# 📡 OpenWrt Monitoring Bot

Bot WhatsApp untuk memantau sistem OpenWrt Anda secara real-time. Dapatkan informasi seperti status koneksi internet, penggunaan memori, suhu CPU, trafik jaringan, dan lainnya — langsung melalui WhatsApp.

---

## 🚀 Fitur Utama

- Pemantauan performa OpenWrt dari jarak jauh
- Statistik trafik jaringan menggunakan `vnStat`
- Pemeriksaan status koneksi internet secara otomatis
- Notifikasi & pesan otomatis untuk kondisi tertentu
- Dapat diperluas untuk kendali jarak jauh (ADB, script custom, dsb)

---

## 🛠️ Instalasi

> **Penting:** Pastikan perangkat OpenWrt Anda sudah memiliki `nodejs` terinstal. Jika belum, jalankan:

```sh
opkg update && opkg install nodejs
```

### Clone Repositori

```sh
git clone https://github.com/ravatz/OpenWrt-Monitoring-Bot.git
cd OpenWrtBot
mv ./config/config.js.example ./config/config.js
mv ./config/setting.json.example ./config/setting.json
```

Edit file `config.js` sesuai kebutuhan Anda, seperti:

- Nomor admin & owner
- Port API & password Clash (jika menggunakan integrasi)

### Instalasi Dependency

> Pastikan semua dependency sudah terinstal:
>
> ```sh
> npm install
> ```

### Menjalankan Bot

```sh
npm run start
```

> 💡 **Tips:** Agar bot tetap berjalan di latar belakang, gunakan `screen` atau `pm2`:
>
> **Menggunakan screen:**
>
> ```sh
> opkg update && opkg install screen
> screen -dmS OpenwrtBot sh -c 'cd /root/OpenWrt-Monitoring-Bot && npm run start >> app.log 2>&1'
> ```
>
> **Menggunakan pm2:**
>
> ```sh
> npm install -g pm2
> cd /root/OpenWrt-Monitoring-Bot
> pm2 start index.js --name OpenwrtBot
> ```

---

## Contoh Perintah

- `menu` → Menampilkan semua menu yang tersedia
- `info` → Informasi sistem: CPU, memori, uptime, IP, dsb
- `vnstati -i eth0 -s -d` → Mengirim grafik trafik jaringan berdasarkan parameter vnStat
- `speedtest` → Menjalankan speedtest dan mengirimkan hasilnya
- `cmd <command>` → Menjalankan perintah shell secara remote (hanya untuk admin)

---

## 📌 Catatan

- Bot ini dibangun menggunakan [Baileys](https://github.com/adiwajshing/Baileys) dan dijalankan langsung di perangkat OpenWrt.
- Pastikan penyimpanan internal cukup dan beban CPU tidak tinggi agar bot berjalan stabil.
