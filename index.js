// index.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const { MistralClient } = require('@mistralai/mistralai');

// Inisialisasi bot Telegram
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Inisialisasi client Mistral AI
const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

// Menangani perintah /start
bot.command('start', async (ctx) => {
    try {
        await ctx.reply('👋 Halo! Saya adalah bot yang menggunakan Mistral AI.\n\nGunakan perintah /help untuk melihat apa yang bisa saya lakukan.');
    } catch (error) {
        console.error('Error pada command start:', error);
    }
});

// Menangani perintah /help
bot.command('help', async (ctx) => {
    try {
        const helpText = `Berikut adalah perintah yang tersedia:

/start - Memulai bot
/help - Menampilkan bantuan
/test - Mengecek koneksi ke Mistral AI

Anda juga bisa langsung mengirim pesan untuk berbicara dengan AI!`;
        
        await ctx.reply(helpText);
    } catch (error) {
        console.error('Error pada command help:', error);
    }
});

// Menangani perintah /test
bot.command('test', async (ctx) => {
    try {
        await ctx.reply('🔄 Mengecek koneksi ke Mistral AI...');
        
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [
                { role: "user", content: "Tolong berikan respons singkat untuk mengkonfirmasi bahwa koneksi berhasil." }
            ]
        });
        
        await ctx.reply('✅ Koneksi berhasil!\n\nRespons dari AI: ' + response.choices[0].message.content);
    } catch (error) {
        console.error('Error pada command test:', error);
        await ctx.reply('❌ Gagal terhubung ke Mistral AI. Error: ' + error.message);
    }
});

// Menangani pesan biasa
bot.on('message', async (ctx) => {
    if (!ctx.message.text) return;
    
    try {
        const userMessage = ctx.message.text;
        console.log('Menerima pesan:', userMessage);
        
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: userMessage }]
        });
        
        await ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error('Error saat memproses pesan:', error);
        await ctx.reply('Maaf, terjadi kesalahan saat memproses pesan Anda.');
    }
});

// Menangani error secara global
bot.catch((err, ctx) => {
    console.error('Error bot secara global:', err);
    ctx.reply('Terjadi kesalahan dalam bot. Mohon coba lagi nanti.');
});

// Memulai bot
bot.launch()
    .then(() => {
        console.log('Bot telah dimulai dan siap menerima pesan!');
    })
    .catch(err => {
        console.error('Error saat memulai bot:', err);
    });

// Menangani graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
