import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import SiteBase from './SiteBase.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteBase />
  </StrictMode>
)