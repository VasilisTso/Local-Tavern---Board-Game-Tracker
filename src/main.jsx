import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { migrate } from './lib/storage'

// Copy pre-v2 data (tavern_games, tavern_rsvp) into the versioned keys before any hook reads.
migrate()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
