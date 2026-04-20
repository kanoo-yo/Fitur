import axios from 'axios'
import FormData from 'form-data'
import sharp from 'sharp'

const uploadUguu = async (buffer, ext) => {
  const fd = new FormData()
  fd.append('files[]', buffer, { filename: `file.${ext}` })
  const res = await axios.post('https://uguu.se/upload.php', fd, {
    headers: fd.getHeaders()
  })
  return res.data?.files?.[0]?.url
}

const handler = async (m, { conn, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return
  const chat = global.db.data.chats[m.chat]
  if (!chat?.nsfw) return

  const isImage = m.mtype === 'imageMessage' || m.msg?.mtype === 'imageMessage'
  const isSticker = m.mtype === 'stickerMessage' || m.msg?.mtype === 'stickerMessage'
  if (!isImage && !isSticker) return

  try {
    let buffer = await m.download()
    if (!buffer) return

    if (isSticker) {
      buffer = await sharp(buffer).toFormat('jpeg').toBuffer()
    }

    const url = await uploadUguu(buffer, 'jpg')
    if (!url) return

    const { data } = await axios.get('https://api.deline.web.id/ai/nsfwcheck', {
      params: { url }
    })

    if (!data?.status) return

    const label = data.result?.labelName
    const confidence = data.result?.confidence || 0

    if (label === 'Porn' && confidence > 0.7) {
      await conn.sendMessage(m.chat, {
        text: `🚫 terdeteksi NSFW ygy harap waspada sama \n@${m.sender.split('@')[0]} gausah cabul di grup kocak`,
        mentions: [m.sender]
      }, { quoted: m })

      if (isBotAdmin) {
        await conn.sendMessage(m.chat, {
          delete: {
            remoteJid: m.chat,
            fromMe: false,
            id: m.key.id,
            participant: m.sender
          }
        })
      }
    }

  } catch (e) {
    console.error('ANTINSFW ERROR:', e.message)
  }
}

handler.before = handler
export default handler
