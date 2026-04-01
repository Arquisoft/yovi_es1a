import React from "react";
import NavBar from "../components/NavBar.tsx";
import "../styles/global.css";
import "../styles/Help.css";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';
import video from "../assets/videoLinea.mp4";

const Ayuda: React.FC = () => {

  //Usar el idioma
  const { t } = useLanguage();
    
  return (
    <div className="ayuda">
      <NavBar activeTab="help" />
      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <div className="content">
        <h2>{t("bienvenido")}</h2>
        
        <h3>{t("introducción")}</h3>
        <p>{t("desc")}</p>
        
        <h3>{t("reglas")}</h3>
        <ul>
          <li>{t("turnos")}</li>
          <li>{t("ganador")}</li>
          <li>{t("esquinas")}</li>
        </ul>
        
        <h3>{t("posibilidades")}</h3>
        <ul>
          <li>{t("bot")}</li>
          <li>{t("estrategia")}</li>
          <li>{t("estadisticasConsultar")}</li>
          <li>{t("tamTablero")}</li>
        </ul>

        <h3>{t("estrategiasDisp")}</h3>
        <ul>
          <li><strong>{t("estrategiaExp")}</strong> {t("expDesc")}</li>
          <li><strong>{t("monteCarlo")}</strong> {t("monteCarloDesc")}</li>
          <li><strong>{t("bloqueo")}</strong> {t("bloqueoDesc")}</li>
          <li><strong>{t("random")}</strong> {t("randomDesc")}</li>
          <li><strong>{t("shortestPath")}</strong> {t("shortDesc")}</li>
          <li><strong>{t("bloqueSimple")}</strong> {t("bloqueSimpleDesc")}</li>
          <li><strong>{t("trian")}</strong> {t("trianDesc")}</li>
        </ul>
      </div>
    </div>
  );
};

export default Ayuda;