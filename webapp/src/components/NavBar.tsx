import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import avatar from '../assets/avatar.png'; 
import { useLanguage } from "../idiomaConf/LanguageContext";

interface NavBarProps {
  activeTab: "play" | "stats" |"Ayuda";
}

const NavBar: React.FC<NavBarProps> = ({ activeTab }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ userId: string; username: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  //Usar el idioma
  const { t, lang, setLang } = useLanguage();

  // Función para cambiar idioma
  const changeLangTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    switch (selected) {
      case "es":
        setLang("es");
        break;
      case "en":
        setLang("en");
        break;
      case "it":
        setLang("it");
        break;
      case "fr":
        setLang("fr");
        break;
      case "de":
        setLang("de");
        break;
      default:
        setLang("es");
    }
  };




  return (
    <nav className="nav-bar">
      <div className="nav-left">
        <button 
          onClick={() => navigate("/jugar")}
          className={`nav-item ${activeTab === "play" ? "active" : ""}`}
        >
          {t("jugar")}
        </button>
        <button 
          onClick={() => navigate("/estadisticas")}
          className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
        >
          {t("estadisticas")}
        </button>
        <button 
          onClick={() => navigate("/ayuda")}
          className={`nav-item ${activeTab === "Ayuda" ? "active" : ""}`}
        >
          {t("ayuda")}
        </button>
      </div>

      <div className="nav-right">
        <select 
              className="control-input"
              value={lang} 
              onChange={changeLangTo}
            >
          <option value="es">{t("esp")}</option>
          <option value="en">{t("en")}</option>
          <option value="it">{t("it")}</option>
          <option value="fr">{t("fr")}</option>
          <option value="de">{t("de")}</option>
        </select>

        <button className="nav-item perfil" onClick={handleLogout} title="Cerrar sesión">
          <img src={avatar} className="avatar" alt="avatar" />
          <span className="username">{user?.username || "Invitado"}</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;