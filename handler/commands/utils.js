import { downloadContentFromMessage } from "baileys";
import { Buffer } from "buffer";

export async function addAdmin(sock, m) {
  await sock.readMessages([m.key]);
  await m.reactWait();

  if (m.args.length < 2) {
    await m.reactErr();
    return m.reply("❌ Format: addadmin 628xxx <nama>");
  }

  const newNumber = m.args[0].replace(/\D/g, "");
  const name = m.args.slice(1).join(" ").trim();

  if (!newNumber || !name) {
    await m.reactErr();
    return m.reply("❌ Nomor atau nama tidak valid.");
  }

  const existsNumber = global.bot.admin.find((a) => a.number === newNumber);
  const existsName = global.bot.admin.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );

  if (existsNumber) {
    await m.reactSucces();
    return m.reply(`ℹ️ Nomor ${newNumber} sudah terdaftar sebagai admin.`);
  }

  if (existsName) {
    await m.reactErr();
    return m.reply(`❌ Nama *${name}* sudah digunakan oleh admin lain.`);
  }

  global.bot.admin.push({ number: newNumber, name });
  global.bot.setting.admin = global.bot.admin;
  await global.bot.saveSetting();
  await m.reactSucces();
  return m.reply(`✅ Admin *${name}* (${newNumber}) ditambahkan.`);
}

export async function deleteAdmin(sock, m) {
  await sock.readMessages([m.key]);
  await m.reactWait();

  if (!m.args[0]) {
    await m.reactErr();
    return m.reply("❌ Format: deladmin 628xxx *atau* deladmin <nama>");
  }

  const input = m.args.join(" ").trim();
  const inputNumber = input.replace(/\D/g, "");

  // Cari berdasarkan nomor atau nama
  const admin = global.bot.admin.find(
    (a) =>
      a.number === inputNumber || a.name.toLowerCase() === input.toLowerCase()
  );

  if (!admin) {
    await m.reactErr();
    return m.reply("❌ Admin tidak ditemukan.");
  }

  global.bot.admin = global.bot.admin.filter((a) => a !== admin);
  global.bot.setting.admin = global.bot.admin;
  await global.bot.saveSetting();
  await m.reactSucces();
  return m.reply(`✅ Admin *${admin.name}* (${admin.number}) dihapus.`);
}

export async function listAdmin(sock, m) {
  await sock.readMessages([m.key]);
  await m.reactWait();

  const admins = global.bot.admin;
  if (!admins || admins.length === 0) {
    await m.reactSucces();
    return m.reply("ℹ️ Belum ada admin yang terdaftar.");
  }

  const list = admins
    .map((a, i) => `${i + 1}. *${a.name}*\nwa.me/${a.number}`)
    .join("\n");

  await m.reactSucces();
  return m.reply(`📋 *Daftar Admin:*\n${list}`, null, { linkPreview: false });
}

export async function setProfilePicture(sock, m) {
  await sock.readMessages([m.key]);
  if (m.type !== "imageMessage") {
    await m.reply(
      "❌ Kirim gambar dengan caption *setpp* untuk mengganti foto profil bot."
    );
    return true;
  }

  await m.reactWait();
  const buffer = await downloadMedia(m);

  if (!buffer) {
    await m.reactErr();
    return m.reply("❌ Gagal mengunduh gambar.");
  }

  try {
    await sock.updateProfilePicture(sock.user.id, buffer);
    await m.reactSucces();
    await m.reply("✅ Foto profil bot berhasil diperbarui.");
  } catch (e) {
    console.error("SetPP Error:", e);
    await m.reactErr();
    await m.reply("❌ Gagal mengubah foto profil bot.");
  }
  return true;
}

export async function setProfileName(sock, m) {
  await sock.readMessages([m.key]);
  if (!m.args.length) {
    await m.reply("❌ Format: setname <nama baru>");
    return true;
  }

  try {
    const name = m.args.join(" ");
    await sock.updateProfileName(name);
    await m.reactSucces();
    await m.reply(`✅ Nama profil bot berhasil diubah menjadi:\n*${name}*`);
  } catch (err) {
    console.error("SetName Error:", err);
    await m.reactErr();
    await m.reply("❌ Gagal mengubah nama profil bot.");
  }
  return true;
}

export async function setProfileBio(sock, m) {
  await sock.readMessages([m.key]);
  if (!m.args.length) {
    await m.reply("❌ Format: setbio <bio baru>");
    return true;
  }

  try {
    const bio = m.args.join(" ");
    await sock.updateProfileStatus(bio);
    await m.reactSucces();
    await m.reply(`✅ Bio/Info berhasil diperbarui:\n*${bio}*`);
  } catch (err) {
    console.error("SetBio Error:", err);
    await m.reactErr();
    await m.reply("❌ Gagal mengubah bio/info bot.");
  }
  return true;
}
async function downloadMedia(m) {
  try {
    const mediaType = m.type.replace("Message", "");
    const mediaMsg = m.message?.[m.type];

    if (!mediaMsg) {
      console.error("downloadMedia: Tidak ada pesan media ditemukan.");
      return null;
    }

    const stream = await downloadContentFromMessage(mediaMsg, mediaType);
    let buffer = Buffer.from([]);

    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer;
  } catch (err) {
    console.error("downloadMedia error:", err);
    return null;
  }
}
