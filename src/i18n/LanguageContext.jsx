import { createContext, useContext, useState } from 'react';
import { translations, t } from './translations';

const LanguageContext = createContext();

function detectLanguage() {
  const lang = navigator.language || navigator.languages?.[0] || 'en';
  return lang.startsWith('nl') ? 'nl' : 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectLanguage);

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
