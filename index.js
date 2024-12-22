// index.js
require('dotenv').config();
const { Telegraf } = require('telegraf');
const MistralClient = require('mistralai');

// Inisialisasi bot
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// Inisialisasi Mistral AI client
const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

// Perintah /start untuk memulai bot
bot.command('start', async (ctx) => {
    await ctx.reply('Bot aktif! Gunakan perintah /test untuk mengecek koneksi ke Mistral.ai');
});

// Perintah /test untuk mengecek koneksi Mistral
bot.command('test', async (ctx) => {
    try {
        // Kirim pesan bahwa tes sedang berjalan
        await ctx.reply('Mengecek koneksi ke Mistral.ai...');
        
        // Coba melakukan request sederhana ke Mistral
        const response = await mistral.chat({
            messages: [{ role: 'user', content: 'Tolong balas dengan: "Koneksi ke Mistral.ai berhasil!"' }],
            model: 'mistral-tiny'
        });
        
        // Kirim hasil tes
        await ctx.reply('✅ Hasil tes:\n\n' + response.choices[0].message.content);
        await ctx.reply('Bot siap digunakan! Anda bisa mengirim pesan apa saja untuk dicoba.');
        
    } catch (error) {
        console.error('Error saat tes Mistral:', error);
        
        // Kirim pesan error yang informatif
        let errorMessage = '❌ Gagal terhubung ke Mistral.ai\n\nDetail error:';
        
        if (error.response) {
            errorMessage += `\nStatus: ${error.response.status}`;
            errorMessage += `\nPesan: ${error.response.data?.error || error.message}`;
        } else {
            errorMessage += `\nPesan: ${error.message}`;
        }
        
        await ctx.reply(errorMessage);
        await ctx.reply('Mohon periksa:\n1. API key Mistral sudah benar\n2. Variable MISTRAL_API_KEY sudah diset di Railway');
    }
});

// Handler untuk pesan biasa
bot.on('message', async (ctx) => {
    if (!ctx.message.text) return;
    
    try {
        const response = await mistral.chat({
            messages: [{ role: 'user', content: ctx.message.text }],
            model: 'mistral-tiny'
        });
        
        await ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Maaf, ada kesalahan dalam memproses pesan Anda.');
    }
});

// Jalankan bot
bot.launch();
