import { exec } from "child_process";

export default async function speedTest(sock, m) {
  // Tambahkan --format=json ke argumen jika belum ada
  const hasFormatArg = m.args.some((arg) => arg.includes("--format"));
  const args = [...m.args];
  if (!hasFormatArg) args.push("--format=json");

  const command = `speedtest ${args.join(" ")}`;
  await m.reactWait();

  exec(command, async (err, stdout, stderr) => {
    if (err) {
      await m.reactErr();
      return await m.reply(`*Error:* ${stderr}`);
    }

    let data;
    try {
      data = JSON.parse(stdout);
    } catch (e) {
      await m.reactErr();
      return await m.reply("*Gagal mem-parsing hasil Speedtest!*");
    }

    const { ping, download, upload, packetLoss, isp, server, result } = data;

    const formatMbps = (bps) => ((bps * 8) / 1e6).toFixed(2); // dari Bps ke Mbps
    const formatMB = (b) => (b / 1e6).toFixed(1); // dari byte ke MB

    const formatted = `
📶 *Speedtest Result by Ookla*

🌐 *ISP:* ${isp}
📍 *Server:* ${server.location} - ${server.name} (ID: ${server.id})

📡 *Ping & Jitter*
- ⚡ *Latency:* ${ping.latency.toFixed(2)} ms
- 🔁 *Jitter:* ${ping.jitter.toFixed(2)} ms
- 📉 *Download Latency:* ${download.latency.iqm.toFixed(2)} ms
- 📈 *Upload Latency:* ${upload.latency.iqm.toFixed(2)} ms

📊 *Result*
⬇️ *Download:* ${formatMbps(download.bandwidth)} Mbps
⬆️ *Upload:* ${formatMbps(upload.bandwidth)} Mbps
📦 *Data Used:* ${formatMB(download.bytes)} MB ↓ / ${formatMB(
      upload.bytes
    )} MB ↑
📭 *Packet Loss:* ${packetLoss} %

🔗 *Result URL:* ${result.url}
`.trim();
    await m.reactSucces();
    await m.reply(formatted);
  });
}
