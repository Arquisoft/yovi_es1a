import { createContext } from "react";     
import { useContext } from "react";        
import { useState } from "react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { messages } from "../recursos/messages";

type Language = "es" | "en" | "fr" | "it" | "de";
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

  useEffect(() => {
    const stored = localStorage.getItem("lang");
    if (["es", "en", "fr", "it", "de"].includes(stored as string)) setLangState(stored as Language);
  }, []);

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