require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { MistralClient } = require('@mistralai/mistralai');

// Inisialisasi express app
const app = express();
app.use(express.json());

// Inisialisasi bot dan mistral client
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

// Middleware untuk parsing update dari Telegram
app.use(bot.webhookCallback('/webhook'));

// Set webhook path
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.RAILWAY_STATIC_URL + '/webhook';

// Perintah bot
bot.command('start', async (ctx) => {
    console.log('Menerima perintah start');
    await ctx.reply('Bot telah aktif! Gunakan /test untuk mengecek koneksi.');
});

bot.command('test', async (ctx) => {
    try {
        console.log('Menjalankan tes koneksi Mistral');
        await ctx.reply('🔄 Mengecek koneksi ke Mistral.ai...');
        
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: "Berikan respons singkat: Koneksi berhasil!" }],
        });
        
        console.log('Respon Mistral diterima:', response.choices[0].message.content);
        await ctx.reply('✅ ' + response.choices[0].message.content);
    } catch (error) {
        console.error('Error saat tes:', error);
        await ctx.reply('❌ Gagal terhubung ke Mistral.ai: ' + error.message);
    }
});

bot.on('message', async (ctx) => {
    if (!ctx.message.text) return;
    
    try {
        console.log('Menerima pesan:', ctx.message.text);
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: ctx.message.text }],
        });
        
        console.log('Mengirim balasan');
        await ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Maaf, ada kesalahan dalam memproses pesan Anda.');
    }
});

// Setup webhook dan mulai server
async function startServer() {
    try {
        // Hapus webhook yang ada
        await bot.telegram.deleteWebhook();
        
        // Set webhook baru
        await bot.telegram.setWebhook(WEBHOOK_URL);
        console.log('Webhook diatur ke:', WEBHOOK_URL);
        
        // Mulai server
        app.listen(PORT, () => {
            console.log(`Server berjalan di port ${PORT}`);
        });
    } catch (error) {
        console.error('Error saat memulai server:', error);
        process.exit(1);
    }
}

// Handle shutdown dengan baik
process.once('SIGINT', () => {
    bot.telegram.deleteWebhook();
    process.exit(0);
});

process.once('SIGTERM', () => {
    bot.telegram.deleteWebhook();
    process.exit(0);
});

// Mulai server
startServer();
