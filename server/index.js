import express from 'express'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ytdlp from 'yt-dlp-exec'

const app = express()
const port = process.env.PORT || 5174

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isLikelyYoutubeUrl = (value) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(value.trim())

const resolveYtdlpPath = () => {
  if (process.env.YTDLP_PATH && existsSync(process.env.YTDLP_PATH)) {
    return process.env.YTDLP_PATH
  }

  if (typeof ytdlp?.path === 'string' && ytdlp.path.length > 0) {
    return ytdlp.path
  }

  const candidates = [
    path.resolve(__dirname, '..', 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe'),
    path.resolve(__dirname, '..', 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp'),
  ]

  const match = candidates.find((candidate) => existsSync(candidate))
  if (match) return match

  return 'yt-dlp'
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/download', (req, res) => {
  const url = String(req.query.url || '').trim()
  const format = String(req.query.format || '').toLowerCase().trim()

  if (!url || !isLikelyYoutubeUrl(url)) {
    res.status(400).json({ error: 'Lien YouTube invalide.' })
    return
  }

  if (format !== 'mp3' && format !== 'mp4') {
    res.status(400).json({ error: 'Format invalide. Utilise mp3 ou mp4.' })
    return
  }

  const filename = `youtube.${format}`
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4')

  const args = ['--no-playlist', '-o', '-']

  if (format === 'mp3') {
    args.push('-x', '--audio-format', 'mp3')
  } else {
    args.push('-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/b')
    args.push('--merge-output-format', 'mp4')
  }

  args.push(url)

  const ytdlpPath = resolveYtdlpPath()
  const process = spawn(ytdlpPath, args, { stdio: ['ignore', 'pipe', 'pipe'] })
  let stderr = ''

  process.stdout.pipe(res)
  process.stderr.on('data', (chunk) => {
    stderr += chunk.toString()
  })

  process.on('close', (code) => {
    if (code !== 0) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Echec du telechargement.' })
      }
      if (stderr) {
        console.error(stderr)
      }
    }
  })

  process.on('error', (error) => {
    console.error(error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Impossible de lancer yt-dlp.' })
    }
  })

  req.on('close', () => {
    if (!process.killed) {
      process.kill('SIGTERM')
    }
  })
})

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
