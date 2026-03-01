import { Link } from "react-router-dom";
import reactLogo from '../assets/react.svg'
import y_dorada from '../assets/y_dorada.png';
import '../App.css';
import { useLanguage } from "../idiomaConf/LanguageContext";


function Home() {
    //Usar el idioma
    const { lang, setLang, t } = useLanguage();

    // Función para cambiar idioma al pulsar el botón
    const changelang = () => {
      setLang(lang === "es" ? "en" : "es");
    };

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <img src={y_dorada} className="y_dorado" alt="y dorado" />
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h2>{t("pantIn")}</h2>
      <h3>{t("OpcionDeseada")}</h3>
      <button onClick={changelang}>{t("idioma")}</button>
      <Link to="/register">
        <button>{t("crearCuenta")}</button>
      </Link>
      
      <Link to="/login">
        <button>{t("iniciarSes")}</button>
      </Link>
      
      <Link to="/botTester">
        <button>{t("botTester")}</button>
      </Link>
      
    </div>
  );
}

//      <BotTester />  {/* Temporary component to test the connection with the Rust Bot (port 4000) */}

export default Home;
