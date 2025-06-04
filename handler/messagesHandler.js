import clashPingCommand from "./commands/clashCommands.js";
import { executeShellCommand } from "./commands/command.js";
import infoDevices from "./commands/infoDev.js";
import speedTest from "./commands/speedtest.js";
import {
  addAdmin,
  deleteAdmin,
  listAdmin,
  setProfileBio,
  setProfileName,
  setProfilePicture,
} from "./commands/utils.js";
import sendStat from "./commands/vnstati.js";
import menuCommand from "./commands/menu.js";
import pingPong from "./commands/ping.js";

export default async function messagesHandler(sock, m) {
  switch (m.cmd) {
    case "menu":
      await sock.readMessages([m.key]);
      await menuCommand(sock, m);
      return true;
    case "cmd":
      await sock.readMessages([m.key]);
      await executeShellCommand(sock, m);
      return true;
    case "ping":
      await sock.readMessages([m.key]);
      await pingPong(sock, m);
      return true;
    case "clash":
      await sock.readMessages([m.key]);
      await clashPingCommand(sock, m);
      return true;
    case "info":
      await sock.readMessages([m.key]);
      await infoDevices(sock, m);
      return true;
    case "speedtest":
      await sock.readMessages([m.key]);
      await speedTest(sock, m);
      return true;
    case "vnstati":
      await sock.readMessages([m.key]);
      await sendStat(sock, m);
      return true;
    case "setpp":
    case "setname":
    case "setbio":
    case "admin":
    case "addadmin":
    case "deladmin":
      if (m.senderId.replace("@s.whatsapp.net", "") !== global.owner.number) {
        await m.reply("⚠️ Perintah ini hanya bisa digunakan oleh owner!!!");
        return true;
      }
      if (m.cmd === "setpp") return await setProfilePicture(sock, m);
      if (m.cmd === "setname") return await setProfileName(sock, m);
      if (m.cmd === "setbio") return await setProfileBio(sock, m);
      if (m.cmd === "admin") return await listAdmin(sock, m);
      if (m.cmd === "addadmin") return await addAdmin(sock, m);
      if (m.cmd === "deladmin") return await deleteAdmin(sock, m);
      return true;
    default:
      await sock.readMessages([m.key]);
      return m.reply(
        "Halo, ada yang bisa saya bantu?\nKetik *menu* untuk menampilkan semua menu."
      );
  }
}
