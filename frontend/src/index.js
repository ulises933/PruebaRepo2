import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * Entry point of the React application.
 * It renders the main <App /> component into the #root element.
 */
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
