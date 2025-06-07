import axios from "axios";
import moment from "moment";

export default async function jsholatCommand(sock, m) {
  const args = m.args;
  const isMonthly = args.includes("-m");
  const isWeekly = args.includes("-7");

  // Ambil nama kota (semua args kecuali -m / -7)
  const cityArgs = args.filter((arg) => !["-m", "-7"].includes(arg));
  const CITY = cityArgs.length > 0 ? cityArgs.join(" ") : global.bot.city;
  const COUNTRY = global.bot.country;
  const METHOD = 20; // Muslim World League
  const now = moment();
  const headers = { "User-Agent": "Mozilla/5.0" };

  await m.reactWait();

  try {
    if (isMonthly || isWeekly) {
      const res = await axios.get(`http://api.aladhan.com/v1/calendarByCity`, {
        headers,
        params: {
          city: CITY,
          country: COUNTRY,
          method: METHOD,
          month: now.format("MM"),
          year: now.format("YYYY"),
        },
      });

      const data = res.data.data;
      let text = `🕌 Jadwal Sholat *${CITY}* - `;

      if (isMonthly) {
        text += `Bulan ${now.format("MMMM YYYY")}\n\n`;
      } else {
        text += `7 Hari ke Depan\n\n`;
      }

      text += "Tgl | Imsak | Subuh | Dzuhur | Ashar | Maghrib | Isya\n";
      text += "----|-------|-------|--------|-------|---------|------\n";

      const startIndex = now.date() - 1;
      const endIndex = isMonthly
        ? data.length
        : Math.min(startIndex + 7, data.length);

      for (let i = startIndex; i < endIndex; i++) {
        const item = data[i];
        const tgl = item.date.gregorian.day.padStart(2, "0");
        const timings = item.timings;
        text += `${tgl}  | ${timings.Imsak.slice(0, 5)} | ${timings.Fajr.slice(
          0,
          5
        )} | ${timings.Dhuhr.slice(0, 5)} | ${timings.Asr.slice(
          0,
          5
        )} | ${timings.Maghrib.slice(0, 5)} | ${timings.Isha.slice(0, 5)}\n`;
      }

      await m.reactSucces();
      return m.reply("```" + text.trim() + "```");
    } else {
      const today = now.format("DD-MM-YYYY");
      const res = await axios.get(
        `http://api.aladhan.com/v1/timingsByCity/${today}?city=${CITY}&country=${COUNTRY}&method=${METHOD}`,
        { headers }
      );

      const timings = res.data.data.timings;
      const date = res.data.data.date.readable;

      const text = `🕌 Jadwal Sholat untuk *${CITY}* (${date})
\`\`\`
• Imsak     : ${timings.Imsak}
• Subuh     : ${timings.Fajr}
• Dzuhur    : ${timings.Dhuhr}
• Ashar     : ${timings.Asr}
• Maghrib   : ${timings.Maghrib}
• Isya      : ${timings.Isha}\`\`\``;

      await m.reactSucces();
      return m.reply(text);
    }
  } catch (err) {
    await m.reactErr();
    return m.reply(
      `❌ Gagal mengambil jadwal sholat untuk *${CITY}*: ${
        err.response?.data?.data || err.message
      }`
    );
  }
}
