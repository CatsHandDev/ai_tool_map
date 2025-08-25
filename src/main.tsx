import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'; // インポート

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* アプリ全体をBrowserRouterで囲む */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)