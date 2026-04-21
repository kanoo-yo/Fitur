let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh: *${usedPrefix + command}* Berharap Tak Berpisah`)

  await m.react('⏳')

  try {
    const res = await fetch(`https://kaizenapi.my.id/search/kaze?q=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.result) {
      await m.react('❌')
      return m.reply('Lirik tidak ditemukan.')
    }

    const { title, lyrics } = json.result

    const romaji = extractSection(lyrics, 'ROMAJI:')
    const kanji = extractSection(lyrics, 'KANJI:')
    const indo = extractSection(lyrics, 'INDONESIA:')

    let caption = `*L I R I K   L A G U*\n\n`
    caption += `🎵 *${title}*\n`

    if (kanji && romaji) {
      const romajiLines = romaji.split('\n')
      const kanjiLines = kanji.split('\n')
      let jpSection = ''
      const maxLines = Math.max(romajiLines.length, kanjiLines.length)
      for (let i = 0; i < maxLines; i++) {
        const k = (kanjiLines[i] || '').trim()
        const r = (romajiLines[i] || '').trim()
        if (k || r) {
          if (k) jpSection += k + '\n'
          if (r) jpSection += r + '\n'
        } else {
          jpSection += '\n'
        }
      }
      caption += jpSection.trimEnd()
    } else {
      caption += lyrics.trim()
    }

    if (indo) {
      caption += `\n\n✦•┈๑⋅⋯┈─────  ─────┈⋯⋅๑┈•✦\n`
      caption += `🇮🇩 *Terjemahan Indonesia*\n\n`
      caption += indo.trimEnd()
    }

    caption += `\n\n*Request by*: ${m.pushName}\n*DATE*: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`

    await m.react('✅')
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Gagal mengambil lirik.')
  }
}

function extractSection(lyrics, header) {
  const idx = lyrics.indexOf(header)
  if (idx === -1) return ''

  const start = idx + header.length
  const nextHeaders = [
    'ROMAJI:', 'KANJI:', 'ENGLISH TRANSLATION (KAZELYRICS VERSION):',
    'INDONESIA:', 'RELATED ARTICLES:', '[Lyrics,', 'TENTANG LAGU'
  ]

  let end = lyrics.length
  for (const h of nextHeaders) {
    if (h === header) continue
    const pos = lyrics.indexOf(h, start)
    if (pos !== -1 && pos < end) end = pos
  }

  return lyrics.slice(start, end).trim()
}

handler.help = ['lirik <judul lagu>']
handler.tags = ['music']
handler.command = /^(lirik|lyrics)$/i
handler.limit = false

export default handler
