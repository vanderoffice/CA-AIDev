/**
 * main.jsx
 *
 * Application entry point.
 * This is where React mounts the app to the DOM.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Create React root and render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
