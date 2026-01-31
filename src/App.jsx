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
  const [status, setStatus] = useState('')

  const isValid = useMemo(() => {
    if (!url.trim()) return false
    return isLikelyYoutubeUrl(url)
  }, [url])

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isValid) {
      setStatus('Le lien doit provenir de YouTube (youtube.com ou youtu.be).')
      return
    }

    setStatus(
      'Mode demo : aucun backend etant branche, le telechargement est simule.'
    )
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
          Colle un lien, choisis un format, puis lance le telechargement. Interface
          front-end prete a etre connectee a un backend plus tard.
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
            <select value={format} onChange={(event) => setFormat(event.target.value)}>
              {FORMATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="cta" disabled={!url.trim()}>
            Telecharger en {format.toUpperCase()}
          </button>

          {status && (
            <p className={isValid ? 'status status--info' : 'status status--error'}>
              {status}
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
            <h3>Prete pour l'etape suivante</h3>
            <p>Branche un backend plus tard pour activer le telechargement.</p>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
