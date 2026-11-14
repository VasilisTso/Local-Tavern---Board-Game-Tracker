import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { KEYS, migrate, read } from './lib/storage'
import { pruneCovers } from './lib/coverStore'

// Copy v1/v2 data into the v3 keys before any hook reads.
migrate()

// Drop cover images no item points at any more (no undo can be pending at startup).
const storedItems = read(KEYS.items)
if (Array.isArray(storedItems)) pruneCovers(storedItems.map((item) => item?.coverId))

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
