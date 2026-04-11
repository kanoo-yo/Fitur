/** 
* Fitur: top4top
* Author: kanoo
* Scraper: yabes
* Channel: https://whatsapp.com/channel/0029VbCKm3I5EjxsUbvmVf33
*/

const handler = async (m, { conn }) => {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime) return m.reply('Kirim atau reply file/gambar yang mau diupload!');

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    try {
        const buffer = await q.download();
        const fileName = q.msg?.fileName || `file_${Date.now()}.${mime.split('/')[1] || 'bin'}`;

        const formData = new FormData();
        for (let i = 0; i < 10; i++) {
            const fieldName = `file_${i}_`;
            if (i === 0) {
                formData.append(fieldName, new Blob([buffer], { type: mime }), fileName);
            } else {
                formData.append(fieldName, '');
            }
        }
        formData.append('submitr', '[ رفع الملفات ]');

        const res = await fetch('https://top4top.io/index.php', {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36'
            },
            body: formData
        });

        const html = await res.text();
        const linkRegex = /<a\s+onclick="window\.open\(this\.href,'_blank'\);return false;"\s+href="(.*?)"/gi;
        const matches = [...html.matchAll(linkRegex)];
        const links = matches.map(match => match[1]);

        if (!links.length) throw new Error('Gagal mendapatkan link upload.');

        const now = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        await m.reply(`🔗 *Link*:\n${links.join('\n')}`);

        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    } catch (e) {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
        m.reply(`Gagal!\n${e.message}`);
    }
};

handler.command = /^(top4top)$/i;
handler.help = ['top4top'];
handler.tags = ['tools'];
handler.limit = true;
handler.register = true;

export default handler;
