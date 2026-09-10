import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initAntiInspect } from './utils/antiInspect'

// Khởi tạo các tầng phòng vệ chống F12, chuột phải và xem source code
initAntiInspect()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
