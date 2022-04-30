import './shim'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'
import './index.css'

window.electronAPI.handleText((event, text) => {
  if (typeof (text) !== 'undefined') {
    document.getElementsByClassName('cm-content')[0].textContent = text
  }
})

const container = document.getElementById('root')

const root = createRoot(container!)
root.render(<App />)

