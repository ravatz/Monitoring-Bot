import {
  isJidGroup,
  isJidNewsletter,
  isJidStatusBroadcast,
  makeWASocket,
  useMultiFileAuthState,
} from "baileys";
import pino from "pino";
import fs from "fs";
import question from "./utils/question.js";
import qrcode from "qrcode-terminal";
import express from "express";
import "./config/config.js";
import moment from "moment";
import messagesUpsert from "./handler/messages.upsert.js";

let alreadySentStartupMessage = false;
let sock;

(async function start(usePairingCode = true) {
  const session = await useMultiFileAuthState("session");

  sock = makeWASocket({
    auth: session.state,
    browser: ["Linux", "Chrome", "137.0.7151.68"],
    logger: pino({
      level: "silent",
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    }),
    shouldIgnoreJid: (jid) =>
      isJidNewsletter(jid) || isJidStatusBroadcast(jid) || isJidGroup(jid),
  });

  sock.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }) => {
      if (connection === "close") {
        console.log("⛔ Connection closed:", lastDisconnect?.error);
        const { statusCode, error } =
          lastDisconnect?.error?.output?.payload || {};
        if (statusCode === 401 && error === "Unauthorized") {
          await fs.promises.rm("session", { recursive: true, force: true });
        }
        return start(usePairingCode);
      }
      if (connection === "open") {
        console.log(
          "✅ Bot WhatsApp tersambung dengan: " + sock.user.id.split(":")[0]
        );

        //         if (!alreadySentStartupMessage) {
        //           alreadySentStartupMessage = true;
        //           const waktu = moment().format("YYYY-MM-DD HH:mm:ss");
        //           const pesan = `🚀 *Bot Aktif*
        // \`\`\`➢ Bot Name : ${global.bot.name}
        // ➢ Version  : ${global.bot.version}
        // ➢ TimeZone : ${global.bot.timezone}
        // ➢ Waktu    : ${waktu}
        // ➢ Owner    : ${global.owner.name}
        // ➢ Deskripsi: ${global.bot.description}

        // 📋 Menu
        // ➢ jsholat [kota] [-7|-m] : Jadwal sholat hari ini, mingguan, atau bulanan

        // ➢ cmd [command]        : Jalankan perintah shell
        // ➢ getfile              : Download file dari server
        // ➢ listfile [path] [fil]: Lihat daftar file di server
        // ➢ ping [domain]        : Ping ke server, tambahkan domain jika ingin ping ke internet
        // ➢ vnstati [opt]        : Kirim grafik statistik jaringan (vnStat)
        // ➢ speedtest            : Jalankan speedtest
        // ➢ info                 : Info perangkat

        // ➢ setpp                : Kirim gambar dengan caption ini untuk ganti foto profil
        // ➢ setname [nama]       : Ganti nama profil bot
        // ➢ setbio [bio]         : Ganti info profil bot

        // ➢ menu                 : Tampilkan kembali menu ini
        // \`\`\``;
        //           await sock.sendMessage(global.owner.number + "@s.whatsapp.net", {
        //             text: pesan,
        //           });
        //         }
      }
      // 🟡 Tampilkan QR jika bukan mode pairing code
      if (!usePairingCode && qr) {
        qrcode.generate(qr, { small: true });
      }
    }
  );

  sock.ev.on("creds.update", session.saveCreds);

  sock.ev.on("call", async (callUpdate) => {
    if (!global.bot.antiCall) return;
    for (const call of callUpdate) {
      const callerId = call.from;

      if (call.status === "offer") {
        await sock.rejectCall(call.id, call.from, call.isVideo);

        await sock.sendMessage(callerId, {
          text: `Maaf, panggilan ${
            call.isVideo ? "video" : "suara"
          } ditolak otomatis.\n\nBot tidak menerima panggilan.`,
        });

        const callerNumber = callerId.split("@")[0];
        await sock.sendMessage(global.owner.number + "@s.whatsapp.net", {
          text: `📞 Panggilan ${
            call.isVideo ? "video" : "suara"
          } dari ${callerNumber} ditolak.`,
        });
      }
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    if (messages && messages[0]) {
      messagesUpsert(sock, messages[0]);
    }
  });

  // 🔐 Jika ingin pairing code, lakukan di sini
  if (usePairingCode && !sock.user && !sock.authState.creds.registered) {
    usePairingCode =
      (
        await question("Ingin terhubung menggunakan pairing code? [Y/n]: ")
      ).toLowerCase() !== "n";
    if (!usePairingCode) return start(false); // fallback ke QR

    const waNumber = await question("Masukkan nomor WhatsApp Anda: +");
    const code = await sock.requestPairingCode(waNumber.replace(/\D/g, ""));
    console.log(`\x1b[44;1m\x20PAIRING CODE\x20\x1b[0m\x20${code}`);
  }
})();

// EXPRESS API
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/send", async (req, res) => {
  if (!sock)
    return res.status(500).send("⚠️ Bot belum siap. Tunggu sebentar...");

  const { message, target } = req.body;
  if (!message) return res.status(400).send("⚠️ Pesan tidak boleh kosong");

  try {
    const targets = target
      ? [`${target.replace(/\D/g, "")}@s.whatsapp.net`]
      : [`${global.owner.number}@s.whatsapp.net`];

    for (const jid of targets) {
      await sock.sendMessage(jid, { text: message });
    }
    res.send("✅ Pesan berhasil dikirim ke WhatsApp!");
  } catch (error) {
    console.error("❌ Error mengirim pesan:", error);
    res.status(500).send("⚠️ Gagal mengirim pesan.");
  }
});

// JALANKAN SERVER
app.listen(3000, () => {
  console.log("🚀 Server API berjalan di http://localhost:3000");
});
