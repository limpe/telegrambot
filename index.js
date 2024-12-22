require('dotenv').config();
const { Telegraf } = require('telegraf');
const { MistralClient } = require('@mistralai/mistralai');

// Inisialisasi bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Inisialisasi Mistral AI client dengan versi yang benar
const mistral = new MistralClient(process.env.MISTRAL_API_KEY);

// Fungsi untuk memeriksa konfigurasi
async function checkConfiguration(ctx) {
    let configStatus = '🔍 Pemeriksaan Konfigurasi:\n\n';
    
    // Periksa Telegram Token
    configStatus += `Telegram Token: ${process.env.BOT_TOKEN ? '✅ Terdeteksi' : '❌ Tidak ditemukan'}\n`;
    configStatus += `Mistral API Key: ${process.env.MISTRAL_API_KEY ? '✅ Terdeteksi' : '❌ Tidak ditemukan'}\n`;
    
    await ctx.reply(configStatus);
}

// Perintah /debug untuk memeriksa konfigurasi
bot.command('debug', async (ctx) => {
    await checkConfiguration(ctx);
});

// Perintah /test yang lebih informatif
bot.command('test', async (ctx) => {
    try {
        await ctx.reply('🚀 Memulai tes koneksi ke Mistral.ai...');
        
        // Log untuk debugging
        console.log('Mencoba koneksi ke Mistral dengan API key:', 
            process.env.MISTRAL_API_KEY ? 'Ada (beberapa karakter terakhir: ' + 
            process.env.MISTRAL_API_KEY.slice(-4) + ')' : 'Tidak ada');
        
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: "Berikan respons pendek: Halo!" }],
        });
        
        console.log('Respon dari Mistral:', response);
        
        await ctx.reply('✅ Koneksi berhasil!\nRespon Mistral: ' + response.choices[0].message.content);
        
    } catch (error) {
        console.error('Error lengkap:', error);
        
        let errorMessage = '❌ Error terdeteksi:\n\n';
        
        if (error.name === 'TypeError' && error.message.includes('mistral.chat')) {
            errorMessage += '- Sepertinya ada masalah dengan instalasi package Mistral\n';
            errorMessage += '- Pastikan package.json mencantumkan: "@mistralai/mistralai": "latest"\n';
        } else if (error.response) {
            errorMessage += `- Status: ${error.response.status}\n`;
            errorMessage += `- Detail: ${JSON.stringify(error.response.data)}\n`;
        } else {
            errorMessage += `- Error: ${error.message}\n`;
        }
        
        await ctx.reply(errorMessage);
    }
});

// Handler pesan biasa dengan logging
bot.on('message', async (ctx) => {
    if (!ctx.message.text) return;
    
    try {
        console.log('Menerima pesan:', ctx.message.text);
        
        const response = await mistral.chat({
            model: "mistral-tiny",
            messages: [{ role: "user", content: ctx.message.text }],
        });
        
        console.log('Respon Mistral:', response.choices[0].message.content);
        
        await ctx.reply(response.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Maaf, ada kesalahan dalam memproses pesan Anda.');
    }
});

// Jalankan bot
bot.launch();
