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

  // Función para cambiar idioma al pulsar el botón
      const changelang = () => {
        if (lang === "es") {
          setLang("en");
        } else if (lang === "en") {
          setLang("fr");
        } else if (lang === "fr") {
          setLang("it");
        } else if (lang === "it") {
          setLang("de");
        } else {
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
        <button className="nav-item" onClick={changelang}>{t("idioma")}</button>
        <button className="nav-item perfil" onClick={handleLogout} title="Cerrar sesión">
          <img src={avatar} className="avatar" alt="avatar" />
          <span className="username">{user?.username || "Invitado"}</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;