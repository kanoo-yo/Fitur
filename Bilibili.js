import * as cheerio from "cheerio"
import { exec } from "node:child_process"
import fs from "node:fs/promises"
import { promisify } from "node:util"

const execPromise = promisify(exec)

async function bilibilidl(url, quality = "480P") {
  let aid = /\/video\/(\d+)/.exec(url)?.[1]
  if (!aid) throw new Error("ID Video not found")

  const html = await fetch(url).then(v => v.text())
  const $ = cheerio.load(html)

  const title = $('meta[property="og:title"]').attr("content")?.split("|")[0]?.trim() || ""
  const description = $('meta[property="og:description"]').attr("content") || ""
  const type = $('meta[property="og:video:type"]').attr("content") || ""
  const cover = $('meta[property="og:image"]').attr("content") || ""
  const like = $(".interactive__btn.interactive__like .interactive__text").text() || ""
  const views = $(".bstar-meta__tips-left .bstar-meta-text").first().text().replace(" Ditonton", "") || ""

  const play = await fetch("https://api.bilibili.tv/intl/gateway/web/playurl?" + new URLSearchParams({
    s_locale: "id_ID",
    platform: "web",
    aid,
    qn: "64",
    type: "0",
    device: "wap",
    tf: "0",
    spm_id: "bstar-web.ugc-video-detail.0.0",
    from_spm_id: "bstar-web.homepage.trending.all",
    fnval: "16",
    fnver: "0"
  })).then(v => v.json())

  const videoSel = play.data.playurl.video.find(v => v.stream_info.desc_words === quality)
  if (!videoSel) throw new Error("No video found for specified quality")

  const videoUrl = videoSel.video_resource.url || videoSel.video_resource.backup_url?.[0]
  const audioUrl = play.data.playurl.audio_resource[0].url || play.data.playurl.audio_resource[0].backup_url?.[0]

  async function downloadBuffer(url) {
    let chunks = []
    let start = 0
    let end = 5 * 1024 * 1024 - 1
    let size = 0

    while (true) {
      const res = await fetch(url, {
        headers: {
          Range: `bytes=${start}-${end}`,
          Origin: "https://www.bilibili.tv",
          Referer: "https://www.bilibili.tv/video/",
          "User-Agent": "Mozilla/5.0"
        }
      })

      const buffer = Buffer.from(await res.arrayBuffer())

      if (!size) {
        const cr = res.headers.get("content-range")
        if (cr) size = Number(cr.split("/")[1])
      }

      chunks.push(buffer)

      if (end >= size - 1) break
      start = end + 1
      end = Math.min(start + 5 * 1024 * 1024 - 1, size - 1)
    }

    return Buffer.concat(chunks)
  }

  const vBuf = await downloadBuffer(videoUrl)
  const aBuf = await downloadBuffer(audioUrl)

  const vPath = "tmp_v.mp4"
  const aPath = "tmp_a.mp3"
  const oPath = "tmp_o.mp4"

  await fs.writeFile(vPath, vBuf)
  await fs.writeFile(aPath, aBuf)

  await execPromise(`ffmpeg -i "${vPath}" -i "${aPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${oPath}"`)

  const out = await fs.readFile(oPath)

  await Promise.all([
    fs.unlink(vPath).catch(() => {}),
    fs.unlink(aPath).catch(() => {}),
    fs.unlink(oPath).catch(() => {})
  ])

  return {
    title,
    description,
    type,
    cover,
    views,
    like,
    buffer: out
  }
}

let handler = async (m, { conn, args, command }) => {
  try {
    if (!args[0]) return m.reply(`*Example :* .${command} https://www.bilibili.tv/id/video/4789258100016128?bstar_from=bstar-web.ugc-video-detail.related-recommend.all,720`)
    m.reply(global.wait)
    const q = args.join(" ")
    const [url, reso] = q.split(",").map(v => v.trim())
    const quality = reso ? `${reso}P` : "480P"
    const r = await bilibilidl(url, quality)
    const size = r.buffer.length
    if (size > 100 * 1024 * 1024) {
      await conn.sendMessage(
        m.chat,
        {
          document: r.buffer,
          fileName: `${r.title || "bilibili"}.mp4`,
          mimetype: "video/mp4"
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        { video: r.buffer },
        { quoted: m }
      )
    }
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['bilibili']
handler.tags = ['downloader']
handler.command = ['bilibili','bili']

export default handler
