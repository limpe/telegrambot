const { Telegraf } = require('telegraf');

// Inisialisasi bot dengan token dari environment variable
const bot = new Telegraf(process.env.BOT_TOKEN);

// Menangani perintah /start
bot.command('start', (ctx) => {
    ctx.reply('Halo! Bot telah aktif dan siap digunakan!');
});

// Menangani pesan teks
bot.on('text', (ctx) => {
    ctx.reply('Saya menerima pesan Anda: ' + ctx.message.text);
});

// Menjalankan bot
bot.launch();

// Menangani pemberhentian bot dengan baik
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
