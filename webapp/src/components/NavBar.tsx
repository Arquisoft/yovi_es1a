import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import avatar from '../assets/avatar.png'; 
import { useLanguage } from "../idiomaConf/LanguageContext";
import about from '../assets/about.png'; 

interface NavBarProps { 
  activeTab: "home" | "play" | "stats" | "help" | "login" | "register" | "" | "about";
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

  const { t, lang, setLang } = useLanguage();

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
          onClick={() => navigate("/")}
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
        >
          {t("inicio")}
        </button>

        {user && (
          <>
            <button 
              onClick={() => navigate("/configureGame")}
              className={`nav-item ${activeTab === "play" ? "active" : ""}`}
            >
              {t("jugar")}
            </button>
            <button 
              onClick={() => navigate("/statistics")}
              className={`nav-item ${activeTab === "stats" ? "active" : ""}`}
            >
              {t("estadisticas")}
            </button>
            <button 
              onClick={() => navigate("/help")}
              className={`nav-item ${activeTab === "help" ? "active" : ""}`}
            >
              {t("ayuda")}
            </button>
          </>
        )}
      </div>

      <div className="nav-right">
        
        {/* Contenedor para el icono */}
        <div style={{ position: "relative", display: "inline-block", marginRight: "10px" }}>
          
          {/* Icono flotando */}
          <span style={{ 
            position: "absolute", 
            left: "10px", 
            top: "50%", 
            transform: "translateY(-50%)", 
            pointerEvents: "none", 
            fontSize: "1.2rem" 
          }}>
            🌐
          </span>

          <select 
            className="control-input"
            value={lang} 
            onChange={changeLangTo}
            style={{ paddingLeft: "35px" }} /* Este padding es CLAVE: hace hueco para que el texto no pise al icono */
          >
            <option value="es">{t("esp")}</option>
            <option value="en">{t("en")}</option>
            <option value="it">{t("it")}</option>
            <option value="fr">{t("fr")}</option>
            <option value="de">{t("de")}</option>
          </select>
        </div>

        {!user ? (
          <>
            <button 
              onClick={() => navigate("/login")}
              className={`nav-item ${activeTab === "login" ? "active" : ""}`}
            >
              {t("iniciarSes")}
            </button>
            <button 
              onClick={() => navigate("/register")}
              className={`nav-item ${activeTab === "register" ? "active" : ""}`}
            >
              {t("crearCuenta")}
            </button>
          </>
        ) : (
          <button className="nav-item perfil" onClick={handleLogout} title="Cerrar sesión">
            <img src={avatar} className="avatar" alt="avatar" />
            <span className="username">{user.username}</span>
          </button>
        )}

          <button className="nav-item about" title="About us" onClick={() => navigate("/about")}>
            <img src={about} className="about" alt="about" />
          </button>
      </div>
    </nav>
  );
};

export default NavBar;