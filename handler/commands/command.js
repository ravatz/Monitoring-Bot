import { exec } from "child_process";
export async function executeShellCommand(sock, m) {
  await m.reactWait();
  const args = m.args.join(" ");
  if (!args) {
    await m.reactErr();
    return m.reply("⚠️ Perintah tidak valid.");
  }
  exec(args, async (error, stdout, stderr) => {
    let response = stdout || stderr || "⚠️ Perintah selesai tanpa output.";
    if (error) {
      response = `❌ Error: ${error.message}`;
      await m.reactErr();
      await m.reply(`💻 *Hasil Perintah:*\n\n${response}`);
    } else {
      await m.reactSucces();
      await m.reply(`💻 *Hasil Perintah:*\n\n${response}`);
    }
  });
}
