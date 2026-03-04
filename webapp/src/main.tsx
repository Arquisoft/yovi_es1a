import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from "./idiomaConf/LanguageContext.tsx";


createRoot(document.getElementById('root')!).render(
    <LanguageProvider >
      <StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
      </StrictMode>
    </LanguageProvider >
)
