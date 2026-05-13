import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { LanguageProvider } from './i18n/LanguageContext'

// Static `.landing-prose` blocks in our HTML pages are Dutch-only SEO copy
// kept for crawlers that don't execute JS. Once React mounts, the app renders
// its own translated SEO section, so the static prose would otherwise sit
// underneath as untranslated duplicate content (visible as Dutch even when the
// user selects EN). Hide it once we know the React tree is up.
document.querySelectorAll('.landing-prose').forEach((el) => {
  el.hidden = true;
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
