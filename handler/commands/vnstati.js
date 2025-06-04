import { exec } from "child_process";
import fs from "fs";

export default async function sendStat(sock, m) {
  // Bantuan jika mengandung 'help'
  await m.reactWait();
  if (m.args.includes("help")) {
    await m.reply(`📌 *Perintah: vnstati*
Kirim grafik statistik jaringan vnStat.

✅ *Format*:
  vnstati [opsi...] [-i interface]

🧪 *Contoh*:
  vnstati
  vnstati -s -i eth0
  vnstati -s -d -m -y -i wlan0

📊 *Opsi:*
  -s   Ringkasan (summary)
  -d   Harian (daily)
  -m   Bulanan (monthly)
  -y   Tahunan (yearly)
  -i   Interface, misal eth0/wlan0`);
    await m.reactSucces();
    return true;
  }

  const options = [];
  let iface = "br-lan";

  // Parse argumen
  for (let i = 0; i < m.args.length; i++) {
    if (m.args[i] === "-i" && m.args[i + 1]) {
      iface = m.args[i + 1];
      i++;
    } else {
      options.push(m.args[i]);
    }
  }

  const defaultOpts = ["-s", "-d", "-m", "-y"];
  const selected = options.length > 0 ? options : defaultOpts;

  const baseName = "/tmp/vnstati";
  const captionMap = {
    "-s": "📊 Ringkasan",
    "-d": "📅 Statistik Harian",
    "-m": "🗓️ Statistik Bulanan",
    "-y": "📈 Statistik Tahunan",
  };

  const tasks = selected.map((opt) => {
    return new Promise((resolve) => {
      const cleanOpt = opt.replace(/[^a-z]/gi, "");
      const filename = `${baseName}_${cleanOpt}.png`;
      const cmd = `vnstati ${opt} ${iface ? `-i ${iface}` : ""} -o ${filename}`;

      exec(cmd, (err) => {
        if (err) {
          console.error(`❌ vnstati error:`, err.message);
          return resolve(null);
        }

        try {
          const data = fs.readFileSync(filename);
          fs.unlink(filename, () => {});
          resolve({ data, opt });
        } catch (e) {
          console.error(`❌ Gagal baca file ${filename}:`, e.message);
          resolve(null);
        }
      });
    });
  });

  const results = await Promise.all(tasks);
  const images = results.filter(Boolean);

  if (images.length === 0) {
    await m.reply("❌ Gagal membuat grafik.");
    await m.reactErr();
  }

  for (const item of images) {
    const captionBase = captionMap[item.opt] || "📊 Statistik Jaringan";
    const fullCaption = iface ? `${captionBase} (${iface})` : captionBase;

    await sock.sendMessage(
      m.chatId,
      {
        image: item.data,
        caption: fullCaption,
      },
      { quoted: m }
    );
  }
  await m.reactSucces();
}
