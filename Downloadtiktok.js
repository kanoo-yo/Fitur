/**
* Fitur: tiktok downloader support HD vid
* Author: Kanoo
* Channel: https://whatsapp.com/channel/0029VbCM1YCCcW4vfjvGJN02
*/



async function tiktokdl(url) {
    const res = await fetch(`https://tiktok-scraper7.p.rapidapi.com?url=${encodeURIComponent(url)}&hd=1`, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
            'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
            'x-rapidapi-key': 'ca5c6d6fa3mshfcd2b0a0feac6b7p140e57jsn72684628152a'
        }
    });
    const data = await res.json();
    return data.data;
}

const handler = async (m, { args, conn }) => {
    const url = args[0];
    if (!url) return m.reply('Masukkan link TikTok!\nContoh: .tt2 https://vt.tiktok.com/...');
    if (!/^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)\/.+/i.test(url)) {
        return m.reply('Link TikTok tidak valid!');
    }

    m.reply('Mengambil video...');

    try {
        const data = await tiktokdl(url);

        const videoUrl = data?.hdplay || data?.play || null;
        const title = data?.title || '';
        const author = data?.author?.nickname || data?.author?.unique_id || 'Unknown';
        const duration = data?.duration ? `${data.duration}s` : 'N/A';

        if (!videoUrl) throw new Error(`URL video tidak ditemukan: ${JSON.stringify(data)}`);

        const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `*T I K T O K - D L*\n\n👤 *Author*: ${author}\n⏱️ *Duration*: ${duration}\n📝 *Caption*: ${title.slice(0, 200)}\n\n*Request by*: ${m.pushName}\n*© Cecilia*: ${now}`
        }, { quoted: m });
    } catch (e) {
        m.reply(`Gagal!\n${e.message}`);
    }
};

handler.command = /^(tthd|tiktokhd)$/i;
handler.help = ['tthd <url>'];
handler.tags = ['downloader'];
handler.limit = true;
handler.register = true;

export default handler;
