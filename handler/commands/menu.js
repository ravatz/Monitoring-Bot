export default async function menuCommand(sock, m) {
  await m.reply(`📋 *Menu*
\`\`\`
jsholat [kota] [-7|-m] Jadwal sholat hari ini, mingguan, atau bulanan

clash                : Menampilkan semua delay
clash select "grup" "proxy" : Pilih proxy di grup
clash list           : Lihat semua grup & proxy aktif
clash [grup/proxy]   : Cek delay semua proxy dalam grup atau hanya salah satu proxy

cmd <command>        : Jalankan perintah shell  
ping <domain>        : Ping ke server  
vnstati <opt>        : Kirim grafik statistik jaringan (vnStat)  
speedtest            : Jalankan speedtest  
info                 : Info perangkat  

Owner Menu :
admin                : Menampilkan seluruh admin yang terdaftar
addadmin <nomor> <nama>   : Tambah admin  
deladmin [nomor|nama]     : Hapus admin  

setpp                : Kirim gambar dengan caption ini untuk ganti foto profil  
setname <nama>       : Ganti nama profil bot  
setbio <bio>         : Ganti info profil bot  
\`\`\``);
}
