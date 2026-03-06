import { Link } from "react-router-dom";
import reactLogo from '../assets/react.svg'
import y_dorada from '../assets/y_dorada.png';
import '../App.css';
import { useLanguage } from "../idiomaConf/LanguageContext";
import video from "../assets/videoLinea.mp4";
import NavBar from "../components/NavBar";


function Home() {
    //Usar el idioma
    const { lang, setLang, t } = useLanguage();
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
    <div className="App">
      <NavBar activeTab="" />
      <video autoPlay muted loop className="video">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <img src={y_dorada} className="y_dorado" alt="y dorado" />
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{t("bienvenido")}</h1>
      <h2>{t("OpcionDeseada")}</h2>
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
