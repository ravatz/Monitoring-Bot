import { exec as execCb } from "child_process";
import os from "os";
import { promisify } from "util";

export default async function infoDevices(sock, m) {
  await m.reactWait();
  const platform = os.platform();
  const exec = promisify(execCb);

  function formatSize(sizeStr) {
    const size = parseFloat(sizeStr);
    const unit = sizeStr.replace(/[0-9.\s]/g, "").toUpperCase();

    let bytes = 0;

    switch (unit) {
      case "KB":
        bytes = size * 1024;
        break;
      case "MB":
        bytes = size * 1024 ** 2;
        break;
      case "GB":
      case "GIB":
        bytes = size * 1024 ** 3;
        break;
      case "TB":
      case "TIB":
        bytes = size * 1024 ** 4;
        break;
      default:
        bytes = size;
        break;
    }

    if (bytes >= 1024 ** 4) return (bytes / 1024 ** 4).toFixed(2) + " TB";
    if (bytes >= 1024 ** 3) return (bytes / 1024 ** 3).toFixed(2) + " GB";
    if (bytes >= 1024 ** 2) return (bytes / 1024 ** 2).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " B";
  }

  if (platform === "win32") {
    const mem = process.memoryUsage();
    const info = `🖥️ *System Info*
\`\`\`
• Hostname : ${os.hostname()}
• CPU      : ${os.cpus()[0].model}
• Cores    : ${os.cpus().length}
• Uptime   : ${Math.floor(os.uptime() / 60)} min
• Free Mem : ${(os.freemem() / 1024 / 1024).toFixed(1)} MB
• Used Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB\`\`\``;
    await m.reply(info);
    return await m.reactSucces();
  } else {
    try {
      const [model, archRaw, hostname, uptimeSecRaw] = await Promise.all([
        exec("cat /tmp/sysinfo/model"),
        exec("grep -m 1 'model name' /proc/cpuinfo | awk -F ': ' '{print $2}'"),
        exec("cat /proc/sys/kernel/hostname"),
        exec("awk '{print int($1)}' /proc/uptime"),
      ]);

      const arch = archRaw.stdout.trim().toLowerCase();
      const isArm = arch.includes("arm");
      const zhonetermal = isArm ? "0" : "1";

      const cpuTempRaw = await exec(
        `awk '{printf("%.1f°C", $1/1000)}' /sys/class/thermal/thermal_zone${zhonetermal}/temp 2>/dev/null`
      );

      const uptimeSec = parseInt(uptimeSecRaw.stdout.trim(), 10);
      const days = Math.floor(uptimeSec / 86400);
      const hours = Math.floor((uptimeSec % 86400) / 3600);
      const minutes = Math.floor((uptimeSec % 3600) / 60);
      let uptime;

      if (days >= 30) {
        const months = Math.floor(days / 30);
        const daysRemain = days % 30;
        uptime = `${months}m ${daysRemain}d ${hours}h`;
      } else if (days >= 1) {
        uptime = `${days}d ${hours}h ${minutes}m`;
      } else {
        uptime = `${hours}h ${minutes}m`;
      }

      const [memTotal, memAvail] = await Promise.all([
        exec("awk '/MemTotal/ {printf(\"%.1f\", $2/1024)}' /proc/meminfo"),
        exec("awk '/MemAvailable/ {printf(\"%.1f\", $2/1024)}' /proc/meminfo"),
      ]);

      const memUsed = (
        parseFloat(memTotal.stdout) - parseFloat(memAvail.stdout)
      ).toFixed(1);

      // IP WAN
      const ipWan = await exec(
        `ip -4 -o addr show | awk '$2 != "lo" && $2 != "br-lan" && $2 != "tailscale0" && $2 != "mihomo" && $2 != "nikki" {print "• WAN     : "$4" ("$2")"}'`
      );

      // IP LAN
      const ipLan = await exec(
        `ip -4 -o addr show | awk '/br-lan|tailscale0/ {print "• LAN     : "$4" ("$2")"}'`
      );

      const vnstat = await exec(`vnstat --oneline`);
      const vnSplit = vnstat.stdout.trim().split(";");

      const rxToday = vnSplit[3];
      const txToday = vnSplit[4];
      const todayTotal = vnSplit[5];
      const rxMonth = vnSplit[8];
      const txMonth = vnSplit[9];
      const monthTotal = vnSplit[10];
      const rxTotal = vnSplit[12];
      const txTotal = vnSplit[13];
      const Total = vnSplit[14];

      const info = `🖥️ *System Info*
\`\`\`• Hostname : ${hostname.stdout.trim()}
• Model    : ${model.stdout.trim()}
• Arch     : ${archRaw.stdout.trim()} ${cpuTempRaw.stdout.trim()}
• Uptime   : ${uptime}
• Mem Used : ${memUsed} MB / ${memTotal.stdout.trim()} MB
• Mem Free : ${memAvail.stdout.trim()} MB

${ipWan.stdout.trim()}
${ipLan.stdout.trim()}\`\`\`

📊 *Usage Br-LAN*
\`\`\`📅 Hari Ini
• Download : ${formatSize(rxToday)}
• Upload   : ${formatSize(txToday)}
• Total    : ${formatSize(todayTotal)}
📆 Bulan Ini
• Download : ${formatSize(rxMonth)}
• Upload   : ${formatSize(txMonth)}
• Total    : ${formatSize(monthTotal)}
🧮 Total Keseluruhan
• Download : ${formatSize(rxTotal)}
• Upload   : ${formatSize(txTotal)}
• Total    : ${formatSize(Total)}\`\`\`
`;
      await m.reply(info);
      return await m.reactSucces();
    } catch (err) {
      console.error("Info Error:", err);
      await m.reactErr();
      return await m.reply("❌ Gagal mengambil info sistem.");
    }
  }
}
