import { getContentType, isJidGroup, isJidUser, jidDecode } from "baileys";
import messagesHandler from "./messagesHandler.js";

export default async function messagesUpsert(sock, m) {
  // const adminSet = new Set(global.bot.admin);
  if (!m.message || m.key.fromMe) return;

  m.id = m.key.id;
  m.chatId = m.key.remoteJid;
  m.isGroup = isJidGroup(m.chatId);
  m.isPrivate = isJidUser(m.chatId);
  m.senderId = m.isGroup ? m.key.participant : m.key.remoteJid;
  m.fromMe = m.key.fromMe;
  m.isOwner = jidDecode(m.senderId).user === global.owner.number;
  m.type = getContentType(m.message);
  m.body =
    m.type === "conversation"
      ? m.message.conversation
      : m.message[m.type].caption ||
        m.message[m.type].text ||
        m.message[m.type].singleSelectReply?.selectedRowId ||
        m.message[m.type].selectedButtonId ||
        (m.message[m.type].nativeFlowResponseMessage?.paramsJson
          ? JSON.parse(m.message[m.type].nativeFlowResponseMessage.paramsJson)
              .id
          : "") ||
        "";
  m.text =
    m.type === "conversation"
      ? m.message.conversation
      : m.message[m.type].caption ||
        m.message[m.type].text ||
        m.message[m.type].description ||
        m.message[m.type].title ||
        m.message[m.type].contentText ||
        m.message[m.type].selectedDisplayText ||
        "";
  m.cmd = m.body.trim().normalize("NFKC").split(" ")[0].toLowerCase();
  m.args = m.body
    .trim()
    .replace(/^\S*\b/g, "")
    .split(" ")
    .map((arg) => arg.trim())
    .filter((arg) => arg);

  m.reply = (text) =>
    sock.sendMessage(
      m.chatId,
      {
        text,
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
  m.reactSucces = async () => {
    await sock.sendMessage(m.chatId, { react: { text: "✅", key: m.key } });
  };
  m.reactWait = async () => {
    await sock.sendMessage(m.chatId, { react: { text: "⏳", key: m.key } });
  };
  m.reactErr = async () => {
    await sock.sendMessage(m.chatId, { react: { text: "❌", key: m.key } });
  };
  m.reactClear = async () => {
    await sock.sendMessage(m.chatId, { react: { text: "", key: m.key } });
  };

  const adminNumber = global.bot.admin.map((a) => a.number);

  if (
    m.senderId.replace("@s.whatsapp.net", "") === global.owner.number ||
    adminNumber.includes(m.senderId.replace("@s.whatsapp.net", ""))
  ) {
    const messagesHandled = await messagesHandler(sock, m);
    if (messagesHandled) return;
  } else {
    await sock.readMessages([m.key]);
    return m.reply("*Maaf*, Anda tidak bisa mengakses bot ini!!!");
  }
}
