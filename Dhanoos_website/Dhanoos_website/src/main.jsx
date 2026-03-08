import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import './index.css'  // ← Change this from './App.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}
>
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/admin" element={<AdminDashboard />} />
  </Routes>
</BrowserRouter>

)