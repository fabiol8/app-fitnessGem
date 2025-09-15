import React from 'react'
import { createRoot } from 'react-dom/client'
import MigratedApp from './MigratedApp.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <MigratedApp />
  </React.StrictMode>
)