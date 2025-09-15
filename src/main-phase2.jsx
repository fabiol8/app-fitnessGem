import React from 'react'
import { createRoot } from 'react-dom/client'
import Phase2App from './Phase2App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Phase2App />
  </React.StrictMode>
)