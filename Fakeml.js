/** 
 * Fitur: fakeml
 * Plugins: esm
 * Author: Kanoo 
 * Api: https://api.skylow.web.id
 * Channel: https://whatsapp.com/channel/0029VbCM1YCCcW4vfjvGJN02
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''

    if (!text || !/image/.test(mime)) {
        return m.reply(
            `*example*\n` +
            `Reply/kirim gambar + ${usedPrefix}fakeml kanoo`
        )
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

    try {
        const imgBuffer = await quoted.download()

        const form = new FormData()
        form.append('files[]', new Blob([imgBuffer], { type: mime }), 'image.jpg')

        const uploadRes = await fetch('https://uguu.se/upload', { method: 'POST', body: form })
        const uploadData = await uploadRes.json()
        const imageUrl = uploadData?.files?.[0]?.url

        if (!imageUrl) throw new Error('Gagal upload gambar')

        const params = new URLSearchParams({ text: text.trim(), image: imageUrl })
        const res = await fetch(`https://api.skylow.web.id/api/maker/fakeml?${params}`)

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const buffer = Buffer.from(await res.arrayBuffer())

        const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
        const now = new Date()
        const tgl = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

        const caption =
            `     ▸ *Nickname*: ${text.trim()}\n` +
        await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m })
    } catch (e) {
        m.reply(`❌ Gagal membuat Fake ML.\n_${e.message}_`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.help = ['fakeml <nickname>']
handler.tags = ['maker']
handler.command = /^(fakeml)$/i
handler.limit = false
handler.register = false

export default handler
