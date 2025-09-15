import React from 'react'
import { createRoot } from 'react-dom/client'
import TestApp from './TestApp.jsx'
import './index.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
)