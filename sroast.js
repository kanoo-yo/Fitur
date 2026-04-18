import { Sticker } from 'wa-sticker-formatter'
import { createCanvas } from 'canvas'

function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ')
    let lines = []
    let currentLine = words[0] || ''
    for (let i = 1; i < words.length; i++) {
        let word = words[i]
        let width = ctx.measureText(currentLine + ' ' + word).width
        if (width < maxWidth) {
            currentLine += ' ' + word
        } else {
            lines.push(currentLine)
            currentLine = word
        }
    }
    if (currentLine) lines.push(currentLine)
    return lines
}

async function createRoastSticker(t1, t2, t3) {
    const width = 512
    const height = 512
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    const maxWidth = width - 60
    
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)

    const textColor = '#000000'

    const textBlocks = [
        { text: t1, size: 35, opacity: 0.25, weight: 'bold' },
        { text: t2.toUpperCase(), size: 80, opacity: 1.0, weight: '900' },
        { text: t3, size: 35, opacity: 0.25, weight: 'bold' }
    ]

    let allLines = []
    let totalHeight = 0
    const lineSpacing = 25

    for (let block of textBlocks) {
        if (!block.text) continue
        ctx.font = `${block.weight} ${block.size}px Arial`
        const lines = wrapText(ctx, block.text, maxWidth)
        for (let line of lines) {
            allLines.push({ text: line, size: block.size, opacity: block.opacity, weight: block.weight })
            totalHeight += block.size + lineSpacing
        }
    }

    totalHeight -= lineSpacing
    let startY = (height - totalHeight) / 2 + (allLines[0]?.size / 2 || 0)

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let line of allLines) {
        ctx.font = `${line.weight} ${line.size}px Arial`
        ctx.globalAlpha = line.opacity
        ctx.fillStyle = textColor
        ctx.fillText(line.text, width / 2, startY)
        startY += line.size + lineSpacing
    }

    return canvas.toBuffer('image/png')
}

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Masukan teks: .sroast text1|text2|text3')

    const parts = text.split('|').map(s => s.trim())
    if (parts.length !== 3) return m.reply('Format: .sroast text1|text2|text3')

    const [t1, t2, t3] = parts

    try {
        await m.react('🕒')

        const imgBuffer = await createRoastSticker(t1, t2, t3)
        const sticker = await new Sticker(imgBuffer, {
            type: 'crop',
            pack: global.stickpack || global.namebot || 'Sticker Pack',
            author: global.stickauth || global.author || 'Bot',
            quality: 10
        }).toBuffer()

        await conn.sendFile(m.chat, sticker, '', '', m)
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        throw e
    }
}

handler.help = ['sroast <text1|text2|text3>']
handler.tags = ['sticker']
handler.command = /^(sroast)$/i
handler.limit = true
handler.register = false
handler.group = false

export default handler
