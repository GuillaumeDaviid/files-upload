import { useMemo, useState } from 'react'
import './App.css'

const FORMATS = [
  { value: 'mp3', label: 'MP3 (audio)' },
  { value: 'mp4', label: 'MP4 (video)' },
]

const isLikelyYoutubeUrl = (value) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(value.trim())

function App() {
  const [url, setUrl] = useState('')
  const [format, setFormat] = useState(FORMATS[0].value)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const isValid = useMemo(() => {
    if (!url.trim()) return false
    return isLikelyYoutubeUrl(url)
  }, [url])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isValid) {
      setStatus({
        type: 'error',
        message: 'Le lien doit provenir de YouTube (youtube.com ou youtu.be).',
      })
      return
    }

    setIsLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(
        `/api/download?url=${encodeURIComponent(url)}&format=${format}`
      )

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Le telechargement a echoue.')
      }

      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `youtube.${format}`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)

      setStatus({ type: 'info', message: 'Telechargement lance.' })
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erreur inconnue.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <div className="hero__glow" aria-hidden="true" />
        <p className="eyebrow">YouTube - Convertisseur rapide</p>
        <h1>
          Telecharge ton lien YouTube
          <span> au format MP3 ou MP4.</span>
        </h1>
        <p className="lead">
          Colle un lien, choisis un format, puis lance le telechargement. Le backend
          gere maintenant la conversion.
        </p>
      </header>

      <main className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">Lien YouTube</span>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              aria-invalid={url.length > 0 && !isValid}
              required
            />
          </label>

          <label className="field">
            <span className="field__label">Format</span>
            <select
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {FORMATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="cta" disabled={!url.trim() || isLoading}>
            {isLoading
              ? 'Telechargement en cours...'
              : `Telecharger en ${format.toUpperCase()}`}
          </button>

          {status.message && (
            <p
              className={
                status.type === 'error' ? 'status status--error' : 'status status--info'
              }
            >
              {status.message}
            </p>
          )}
        </form>

        <section className="features">
          <article>
            <h3>Format audio ou video</h3>
            <p>Choisis en un clic le format a generer.</p>
          </article>
          <article>
            <h3>Rapide et clair</h3>
            <p>Une seule action : coller le lien et lancer.</p>
          </article>
          <article>
            <h3>Backend branche</h3>
            <p>Le telechargement passe par l'API locale.</p>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
