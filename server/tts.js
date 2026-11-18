/**
 * 语音合成：微软 Edge TTS（音色 zh-CN-YunxiNeural，中文男声「云希」）
 *
 * 这一版是从直播间的正式版本里抽出来的独立模块，做法和线上一致：
 *   1. 前端先请求 POST /api/tts，拿回 audio/mpeg 直接播；
 *   2. 服务端不可用（断网 / 依赖缺失 / 合成失败）时，降级到浏览器自带的
 *      speechSynthesis 说话——保证断网也能出声，演示不中断。
 *
 * 降级链路的说明见 docs/语音合成与降级链路.md
 *
 * 依赖：npm i msedge-tts
 */
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export const TTS_VOICE = 'zh-CN-YunxiNeural'

/**
 * 把一段文字合成 MP3。
 * @param {string} text
 * @returns {Promise<Buffer>}
 */
export async function synthesize(text) {
  const tts = new MsEdgeTTS()
  await tts.setMetadata(TTS_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
  const { audioStream } = tts.toStream(text)
  const chunks = []
  for await (const c of audioStream) chunks.push(Buffer.from(c))
  return Buffer.concat(chunks)
}

/**
 * 原生 http 的 /api/tts 处理函数。
 * 注意：音频不走 JSON 通道，直接回 audio/mpeg。
 *
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {(req:any)=>Promise<any>} readBody 读取并 JSON.parse 请求体
 */
export async function handleTTS(req, res, readBody) {
  if (req.method !== 'POST') {
    res.writeHead(405).end()
    return
  }
  try {
    const payload = await readBody(req)
    const text = String(payload.text || '').trim().slice(0, 600)
    if (!text) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end('{"error":"EMPTY_TEXT"}')
      return
    }
    const buf = await synthesize(text)
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': buf.length,
      'Cache-Control': 'no-store'
    })
    res.end(buf)
  } catch (e) {
    console.error('[TTS ERROR]', e.message)
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ error: 'TTS_FAILED', message: String(e.message || e) }))
  }
}
