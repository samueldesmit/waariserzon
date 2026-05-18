import { createContext, useContext, useEffect, useState } from 'react';
import { translations, t } from './translations';

const LanguageContext = createContext();

function detectLanguage() {
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.startsWith('nl') ? 'nl' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage);

  // The static `.landing-prose` blocks in our HTML pages are Dutch-only SEO
  // copy (kept visible by default so search crawlers see substantial unique
  // content per URL). When the user picks English, hide them so EN visitors
  // don't see a wall of Dutch below the map. Also keep <html lang> in sync.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.querySelectorAll('.landing-prose').forEach((el) => {
      const proseLang = el.getAttribute('lang') || 'nl';
      el.hidden = proseLang !== lang;
    });
  }, [lang]);

  const strings = translations[lang];
  const tr = (key, replacements) => t(strings, key, replacements);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: tr, strings }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
