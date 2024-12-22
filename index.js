const { Telegraf } = require('telegraf');
const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

// Inisialisasi bot Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);

// Inisialisasi OpenAI untuk AI processing
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Handler untuk pesan /start
bot.command('start', (ctx) => {
    ctx.reply('Selamat datang! Saya adalah bot yang bisa:\n' +
              '1. Menerima pesan suara dan mengubahnya jadi teks\n' +
              '2. Memproses pertanyaan menggunakan AI\n' +
              'Silakan kirim pesan suara atau teks untuk memulai!');
});

// Handler untuk pesan suara
bot.on('voice', async (ctx) => {
    try {
        // Memberitahu user bahwa pesannya sedang diproses
        await ctx.reply('Sedang memproses pesan suara Anda...');
        
        const file = await ctx.telegram.getFile(ctx.message.voice.file_id);
        const filePath = file.file_path;
        
        // Di sini nantinya kita akan tambahkan kode untuk mengubah suara ke teks
        // Untuk saat ini, kita beri response sederhana
        await ctx.reply('Sistem speech-to-text akan segera ditambahkan!');
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Maaf, terjadi kesalahan saat memproses pesan suara.');
    }
});

// Handler untuk pesan teks
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return; // Mengabaikan commands
    
    try {
        await ctx.reply('Memproses pesan Anda...');
        
        // Menggunakan OpenAI untuk memproses pesan
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: ctx.message.text
            }],
        });
        
        await ctx.reply(completion.data.choices[0].message.content);
    } catch (error) {
        console.error('Error:', error);
        await ctx.reply('Maaf, terjadi kesalahan saat memproses pesan Anda.');
    }
});

// Menjalankan bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
