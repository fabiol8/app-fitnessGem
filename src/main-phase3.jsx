import React from 'react'
import { createRoot } from 'react-dom/client'
import Phase3App from './Phase3App.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Phase3App />
  </React.StrictMode>
)