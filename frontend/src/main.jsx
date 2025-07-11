import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--mic-deep-blue)',
              color: 'var(--mic-white)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'var(--mic-logo-green)',
                secondary: 'var(--mic-white)',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'var(--mic-bright-red)',
                secondary: 'var(--mic-white)',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
) 