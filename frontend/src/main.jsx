import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
import awsConfig from './config/awsConfig'
import { AuthProvider } from './contexts/AuthContext'
import './styles/design-system.css'
import './index.css'
import App from './App.jsx'

// Configure AWS Amplify with our settings
Amplify.configure(awsConfig)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

