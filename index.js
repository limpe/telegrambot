require('dotenv').config();
const { Telegraf } = require('telegraf');
const { MistralClient } = require('@mistralai/mistralai');

// Inisialisasi bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Inisialisasi Mistral AI client
const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

// Tambahkan penanganan shutdown yang baik
function setupGracefulShutdown(bot) {
    // Tangani sinyal terminasi
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

// Handler pesan dan commands
bot.command('start', ctx => ctx.reply('Bot telah aktif! Gunakan /test untuk mengecek koneksi.'));

bot.command('test', async (ctx) => {
    try {
        await ctx.reply('🔄 Mengecek koneksi ke Mistral.ai...');
        
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: "Berikan respons singkat: Koneksi berhasil!" }],
        });
        
        await ctx.reply('✅ ' + response.choices[0].message.content);
    } catch (error) {
        console.error('Error saat tes:', error);
        await ctx.reply('❌ Gagal terhubung ke Mistral.ai: ' + error.message);
    }
});

bot.on('message', async (ctx) => {
    if (!ctx.message.text) return;
    
    try {
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: ctx.message.text }],
        });
        
        await ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Maaf, ada kesalahan dalam memproses pesan Anda.');
    }
});

// Jalankan bot dengan opsi khusus untuk mencegah konflik
bot.launch({
    dropPendingUpdates: true,
    allowedUpdates: ['message', 'callback_query']
}).then(() => {
    console.log('Bot telah dimulai');
    setupGracefulShutdown(bot);
}).catch((err) => {
    console.error('Error saat menjalankan bot:', err);
    process.exit(1);
});
