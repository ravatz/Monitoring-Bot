import { exec } from "child_process";
export default async function pingPong(sock, m) {
  const args = m.text.trim().split(" ");

  if (args.length === 1) {
    await m.reactWait();
    const start = m.messageTimestamp * 1000;
    const now = Date.now();
    const diff = now - start;
    const totalSeconds = Math.floor(diff / 1000);
    const milliseconds = diff % 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let timeStr = "*pong* ";

    if (minutes > 0) timeStr += `${minutes} m `;
    if (seconds > 0) timeStr += `${seconds} s `;
    if (totalSeconds < 1 || milliseconds > 0) timeStr += `${milliseconds} ms`;

    await m.reply(`${timeStr.trim()}`);
    await m.reactSucces();
  } else {
    if (m.senderId.replace("@s.whatsapp.net", "") !== global.owner.number) {
      return true;
    }
    const target = args[1];
    await m.reactWait();
    const sentMsg = await sock.sendMessage(
      m.chatId,
      {
        text: `📡 Ping ke *${target}*...`,
      },
      {
        quoted: {
          key: {
            remoteJid: `${m.chatId}`,
            id: m.id,
            fromMe: false,
            participant: `${m.senderId}`,
          },
          message: {
            conversation: `${m.body}`,
          },
        },
      }
    );

    exec(`ping -c 10 ${target}`, async (err, stdout, stderr) => {
      let result;
      if (err) {
        result = `📡 Ping ke *${target}*\n\n❌ Gagal ping:\n${
          stderr || err.message
        }`;
        await m.reactErr();
      } else {
        result = `📡 Ping ke *${target}*\n\n${stdout}`;
        await m.reactSucces();
      }
      // Edit pesan sebelumnya dengan hasilnya
      await sock.sendMessage(m.chatId, {
        text: result,
        edit: sentMsg.key,
      });
    });
  }
}
