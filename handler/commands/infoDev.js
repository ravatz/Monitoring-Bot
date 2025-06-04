import { exec as execCb } from "child_process";
import os from "os";
import { promisify } from "util";

export default async function infoDevices(sock, m) {
  await m.reactWait();
  const platform = os.platform();
  const exec = promisify(execCb);
  if (platform === "win32") {
    // Jika dijalankan di Windows
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
      const [model, arch, cpuTemp, hostname, uptimeSecRaw] = await Promise.all([
        exec("cat /tmp/sysinfo/model"),
        exec("grep -m 1 'model name' /proc/cpuinfo | awk -F ': ' '{print $2}'"),
        exec(
          `awk '{printf("%.1f°C", $1/1000)}' /sys/class/thermal/thermal_zone1/temp 2>/dev/null` //Use thermal_zone0 for STB
        ),
        exec("cat /proc/sys/kernel/hostname"),
        exec("awk '{print int($1)}' /proc/uptime"),
      ]);

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
      // Ambil info IP WAN
      const ipWan = await exec(
        `ip -4 -o addr show | awk '$2 != "lo" && $2 != "br-lan" && $2 != "tailscale0" && $2 != "mihomo" && $2 != "nikki" {print "• WAN     : "$4" ("$2")"}'`
      );

      // Ambil info IP LAN
      const ipLan = await exec(
        `ip -4 -o addr show | awk '/br-lan|tailscale0/ {print "• LAN     : "$4" ("$2")"}'`
      );
      const info = `🖥️ *System Info*
\`\`\`• Hostname : ${hostname.stdout.trim()}
• Model    : ${model.stdout.trim()}
• Arch     : ${arch.stdout.trim()} ${cpuTemp.stdout.trim()}
• Uptime   : ${uptime}
• Mem Used : ${memUsed} MB / ${memTotal.stdout.trim()} MB
• Mem Free : ${memAvail.stdout.trim()} MB

${ipWan.stdout.trim()}
${ipLan.stdout.trim()}\`\`\``;

      await m.reply(info);
      return await m.reactSucces();
    } catch (err) {
      console.error("Info Error:", err);
      await m.reactErr();
      return await m.reply("❌ Gagal mengambil info sistem.");
    }
  }
}
