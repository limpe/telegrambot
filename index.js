const { Telegraf } = require('telegraf');
const axios = require('axios');

// Inisialisasi bot Telegram
const bot = new Telegraf(process.env.BOT_TOKEN);

// Fungsi untuk berkomunikasi dengan Mistral API
async function chatWithMistral(message) {
    try {
        const response = await axios.post('https://chat.mistral.ai/chat?model=ag:30fef39f:20241222:mistral-large-2-1:127fdd78', {
            messages: [{ role: 'user', content: message }],
            model: 'mistral large 2.1'  // Model gratis dari Mistral
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error saat mengakses Mistral API:', error);
        throw error;
    }
}

// Handler untuk pesan /start
bot.command('start', (ctx) => {
    ctx.reply('Selamat datang! Saya adalah bot yang bisa:\n' +
              '1. Menjawab pertanyaan menggunakan AI Mistral\n' +
              '2. Membantu dengan berbagai tugas\n' +
              'Silakan kirim pesan untuk memulai!');
});

// Handler untuk pesan teks
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return; // Mengabaikan commands
    
    try {
        await ctx.reply('Memproses pesan Anda...');
        
        // Menggunakan Mistral untuk memproses pesan
        const response = await chatWithMistral(ctx.message.text);
        await ctx.reply(response);
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
