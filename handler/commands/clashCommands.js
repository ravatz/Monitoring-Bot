import axios from "axios";

export default async function clashPingCommand(sock, m) {
  const baseURL = `http://${global.bot.clashUrl}:${global.bot.clashPort}`;
  const secret = global.bot.clashSecret;
  const headers = secret ? { Authorization: `Bearer ${secret}` } : {};
  const args = m.body.match(/clash\s+select\s+"(.+?)"\s+"(.+?)"/i);
  const subCommand = m.args[0]?.toLowerCase();
  await m.reactWait();

  try {
    // === SELECT MODE ===
    if (subCommand === "select") {
      if (!args) {
        await m.reactErr();
        return m.reply(
          `❌ Format salah.\nContoh: *clash select "grup" "proxy"*`
        );
      }

      const group = args[1];
      const proxy = args[2];
      await axios.put(
        `${baseURL}/proxies/${encodeURIComponent(group)}`,
        { name: proxy },
        { headers }
      );

      await m.reactSucces();
      return m.reply(`✅ *${group}* telah dipilihkan ke *${proxy}*`);
    }

    // === DELAY CHECK MODE ===
    const targetGroup =
      subCommand !== "select" ? m.args.join(" ").trim() : null;
    const { data } = await axios.get(`${baseURL}/proxies`, { headers });
    const proxies = data.proxies;
    const selectors = Object.entries(proxies).filter(
      ([, val]) => val.type === "Selector"
    );

    // === LIST MODE ===
    if (subCommand === "list") {
      let message = `📦 Daftar Grup Proxy\n\n`;

      for (const [groupName, groupData] of selectors) {
        message += `🌐 ${groupName}\n`;
        message += `- Dipilih: ${groupData.now}\n`;
        message += `- Pilihan: ${groupData.all.join(", ")}\n\n`;
      }

      await m.reactSucces();
      return m.reply("```" + message.trim() + "```");
    }

    // === PROXY LANGSUNG MODE ===
    if (
      targetGroup &&
      proxies[targetGroup] &&
      proxies[targetGroup].type !== "Selector"
    ) {
      try {
        const res = await axios.get(
          `${baseURL}/proxies/${encodeURIComponent(targetGroup)}/delay`,
          {
            headers,
            params: {
              timeout: 5000,
              url: "http://www.gstatic.com/generate_204",
            },
          }
        );
        const delay = res.data.delay;
        const emoji = delay < 100 ? "✅" : delay < 200 ? "🟡" : "🔴";
        await m.reactSucces();
        return m.reply(
          `📡 Proxy *${targetGroup}*\n- Delay: ${delay}ms ${emoji}`
        );
      } catch {
        await m.reactErr();
        return m.reply(
          `❌ Proxy *${targetGroup}* timeout atau tidak merespons.`
        );
      }
    }

    // === GROUP PING MODE ===
    let message = `📡 Delay Proxies per Grup\n\n`;
    let filtered = false;

    for (const [groupName, groupData] of selectors) {
      if (
        targetGroup &&
        !groupName.toLowerCase().includes(targetGroup.toLowerCase())
      )
        continue;
      filtered = true;

      message += `🌐 ${groupName}\n`;
      let hasData = false;

      for (const proxyName of groupData.all) {
        const proxy = proxies[proxyName];
        if (!proxy) continue;

        try {
          const res = await axios.get(
            `${baseURL}/proxies/${encodeURIComponent(proxyName)}/delay`,
            {
              headers,
              params: {
                timeout: 5000,
                url: "http://www.gstatic.com/generate_204",
              },
            }
          );
          const delay = res.data.delay;
          const emoji = delay < 100 ? "✅" : delay < 200 ? "🟡" : "🔴";
          message += `- ${proxyName.padEnd(18)} ${delay}ms ${emoji}\n`;
          hasData = true;
        } catch {
          message += `- ${proxyName.padEnd(17)} Timeout\n`;
          hasData = true;
        }
      }

      if (!hasData) message += `- Tidak ada proxy.\n`;
      message += "\n";
    }

    if (!filtered && targetGroup) {
      await m.reactErr();
      return m.reply(`❌ Grup *${targetGroup}* tidak ditemukan.`);
    }

    await m.reactSucces();
    return m.reply("```" + message.trim() + "```");
  } catch (err) {
    await m.reactErr();
    return m.reply(`❌ Gagal: ${err.message}`);
  }
}
