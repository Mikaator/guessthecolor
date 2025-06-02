import { useState } from 'react'
import './App.css'
import { config as importedConfig } from './config.js'

function App() {
  const [config] = useState(importedConfig)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [solved, setSolved] = useState(false)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [mode, setMode] = useState(null) // 'twitch' oder '7tv'

  if (!config || config.length === 0) {
    return <div className="loading">Keine Konfiguration gefunden. Ersetze <b>src/config.js</b> durch deine Daten.</div>
  }

  // Startscreen mit Modus-Auswahl
  if (!started) {
    return (
      <div className="startscreen animate-in">
        <h1>Guess the Color</h1>
        <p className="subtitle">Errate die Twitch-Farbe anhand des Usernamens!</p>
        <div className="mode-select">
          <button className={mode === 'twitch' ? 'mode-btn selected' : 'mode-btn'} onClick={() => setMode('twitch')}>
            Nur Twitch-Farben
          </button>
          <button className={mode === '7tv' ? 'mode-btn selected' : 'mode-btn'} onClick={() => setMode('7tv')}>
            Mit 7TV-Farben (falls vorhanden)
          </button>
        </div>
        <button className="start-btn" onClick={() => mode && setStarted(true)} disabled={!mode}>Spiel starten</button>
      </div>
    )
  }

  // Endscreen
  if (finished) {
    return (
      <div className="endscreen animate-in">
        <h1>Fertig!</h1>
        <p className="subtitle">Du hast <b>{correctCount}</b> von <b>{config.length}</b> richtig erraten.</p>
        <button className="start-btn" onClick={() => {
          setCurrent(0)
          setSelected(null)
          setSolved(false)
          setStarted(false)
          setFinished(false)
          setCorrectCount(0)
          setMode(null)
        }}>Nochmal spielen</button>
      </div>
    )
  }

  const user = config[current]
  // Bestimme die richtige Farbe je nach Modus
  let correctColor = user.real_color
  if (mode === '7tv' && user.seventv_color) {
    correctColor = user.seventv_color
  }

  // Antwortmöglichkeiten generieren
  let answerColors = user.colors
  if (mode === '7tv') {
    // Alle vorkommenden Twitch- und 7TV-Farben sammeln (ohne die richtige)
    const allColorsSet = new Set()
    config.forEach(u => {
      if (u.real_color && u.real_color.toLowerCase() !== correctColor.toLowerCase()) {
        allColorsSet.add(u.real_color.toLowerCase())
      }
      if (u.seventv_color && u.seventv_color.toLowerCase() !== correctColor.toLowerCase()) {
        allColorsSet.add(u.seventv_color.toLowerCase())
      }
    })
    // In Array umwandeln und mischen
    let allColors = Array.from(allColorsSet)
    // Falls weniger als 9, mit Zufallsfarben auffüllen
    while (allColors.length < 9) {
      const rand = '#'+Math.floor(Math.random()*16777215).toString(16).padStart(6,'0')
      if (!allColors.includes(rand.toLowerCase()) && rand.toLowerCase() !== correctColor.toLowerCase()) {
        allColors.push(rand.toLowerCase())
      }
    }
    // 9 zufällige nehmen
    allColors = allColors.sort(() => Math.random() - 0.5).slice(0,9)
    // Richtige Farbe hinzufügen und mischen
    answerColors = [...allColors.map(c => c.startsWith('#') ? c : '#'+c), correctColor]
    answerColors = answerColors.sort(() => Math.random() - 0.5)
  }

  function handleColorClick(color) {
    if (solved) return
    setSelected(color)
    if (color.toLowerCase() === correctColor.toLowerCase()) {
      setSolved(true)
      setTimeout(() => {
        setCorrectCount(c => c + 1)
        setTimeout(() => {
          if (current < config.length - 1) {
            setCurrent(c => c + 1)
            setSelected(null)
            setSolved(false)
          } else {
            setFinished(true)
          }
        }, 700)
      }, 400)
    } else {
      // Falsche Antwort, Animation läuft automatisch
    }
  }

  function next() {
    if (current < config.length - 1) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setSolved(false)
    }
  }
  function prev() {
    if (current > 0) {
      setCurrent((c) => c - 1)
      setSelected(null)
      setSolved(false)
    }
  }

  // Fortschrittsbalken
  const progress = ((current) / config.length) * 100

  return (
    <div className="app-dark">
      <div className="progress-bar-outer">
        <div className="progress-bar-inner" style={{ width: `${progress}%` }} />
      </div>
      <div className="userbox animate-in">
        <span className="username">{user.username}</span>
      </div>
      <div className="colors">
        {answerColors.map((color, i) => (
          <button
            key={color}
            className={
              'color-btn' +
              (selected === color && color.toLowerCase() === correctColor.toLowerCase() ? ' correct' : '') +
              (selected === color && color.toLowerCase() !== correctColor.toLowerCase() ? ' wrong' : '')
            }
            style={{ background: color, transitionDelay: `${i * 30}ms` }}
            onClick={() => handleColorClick(color)}
            disabled={solved}
          >
          </button>
        ))}
      </div>
      <div className="nav">
        <button onClick={prev} disabled={current === 0}>Zurück</button>
        <button onClick={next} disabled={current === config.length - 1}>Weiter</button>
      </div>
    </div>
  )
}

export default App
