'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Lang, translations, Translations } from '@/lib/translations';

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
  T: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'es',
  toggleLang: () => {},
  T: translations.es,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('es');

  useEffect(() => {
    const saved = localStorage.getItem('thf-lang') as Lang | null;
    if (saved === 'en') setLang('en');
  }, []);

  const toggleLang = () => {
    setLang((l) => {
      const next = l === 'es' ? 'en' : 'es';
      localStorage.setItem('thf-lang', next);
      return next;
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, T: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
