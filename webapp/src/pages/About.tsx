import React from "react";
import video from "../assets/videoLinea.mp4";
import NavBar from "../components/NavBar.tsx";
import { useLanguage } from '../idiomaConf/LanguageContext.tsx';

const About: React.FC = () => {

    //Usar el idioma
    const { t } = useLanguage();

    return (
        <div className="aboutView">
            <NavBar activeTab="help" />
            <video autoPlay muted loop className="videoIN">
                <source src={video} type="video/mp4" />
                No se ha podido mostrar el video de fondo
            </video>
        <h2>{t("acercaDe")}</h2>

        <p>{t("introAbout")}</p>

        <h3>{t("autores")}</h3>
        <ul>
            <li>José Iván Díaz Potenciano</li>
            <li>Adrián Gutiérrez García</li>
            <li>Fernando Remis Figueroa</li>
            <li>Hugo Carbajales Quintana</li>
            <li>Sergio Argüelles Huerta</li>
        </ul>

        <h3>{t("tecUtil")}</h3>
        <ul>
            <li>{t("front")}</li>
            <li>{t("back")}</li>
            <li>{t("bd")}</li>
            <li>{t("contener")}</li>
            <li>{t("motor")}</li>
        </ul>

        <h3>{t("estr")}</h3>
        <ul>
            <li>
            <strong>{t("webapp")}</strong>{t("webAppDesc")}
            </li>
            <li>
            <strong>{t("users")}</strong>{t("usersDesc")}
            </li>
            <li>
            <strong>{t("gamey")}</strong>{t("gameyDesc")}
            </li>
            <li>
            <strong>{t("docs")}</strong>{t("docsDesc")}
            </li>
        </ul>

        <h3>{t("proposit")}</h3>
        <p>{t("propositDesc")}</p>
        </div>
    );
};

export default About;