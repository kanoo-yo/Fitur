/**
* Fitur: hitamkan
* Author: kanoo
* Req: tio
* Api: https://api.nexray.web.id
*/

import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn }) => {

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) return conn.reply(
    m.chat,
    'Reply atau kirim gambar dengan caption\nContoh: .hitamkan',
    global.fstatus
  )

  await m.reply('WET SEDANG DI NEGROKAN😡')

  try {
    let media = await q.download()

    let form = new FormData()
    form.append('image', media, 'image.jpg')
    form.append(
      'param',
      'Hitamkan warna kulit karakter ini menjadi hitam pekat, bukan coklat ingat hanya kulit saja jangan sentuh aspek lain'
    )

    let res = await fetch('https://api.nexray.web.id/ai/nanobanana', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    if (!res.ok) throw new Error(await res.text())

    let buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendFile(
      m.chat,
      buffer,
      'hitamkan.jpg',
      'AWOKAOWKAOWK HITAM🫵😂',
      global.fstatus
    )

  } catch (e) {
    console.log('Hitamkan Error:', e)
    conn.reply(
      m.chat,
      'API error.',
      global.fstatus
    )
  }
}

handler.help = ['hitamkan']
handler.tags = ['ai']
handler.command = /^hitamkan$/i
handler.limit = true

export default handler
