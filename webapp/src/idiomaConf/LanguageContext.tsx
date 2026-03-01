import React from "react";
import { createContext } from "react";     // Para crear un contexto
import { useContext } from "react";        // Para usar el contexto en los componentes
import { useState } from "react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { messages } from "../recursos/messages";

type Language = "es" | "en" | "fr" | "it" | "de";
//type Language = keyof typeof messages; // 'es' | 'en' | 'fr'
type MessageKeys = keyof typeof messages["es"];

interface LanguageContextProps {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: MessageKeys) => string;
}

const LanguageContext = createContext<LanguageContextProps>({
  lang: "es",
  setLang: () => {},
  t: (key) => key,
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [lang, setLangState] = useState<Language>("es");

  // Cargar idioma guardado en localStorage
  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (stored === "es" || stored === "en") setLangState(stored);
  }, []);

  // Cambiar idioma y guardar en localStorage
  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key: MessageKeys) => messages[lang][key];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);