import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

// 1. Bootstrap — always first
import 'bootstrap/dist/css/bootstrap.min.css'

// 2. Our global styles (tokens + base) — always after Bootstrap
import '@/styles/index.css'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>

) 
