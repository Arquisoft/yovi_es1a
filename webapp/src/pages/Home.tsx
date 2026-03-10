// Imports de React y otros módulos necesarios
// Imágenes de Vite y React eliminadas
import { Link } from "react-router-dom";
import y_dorada from '../assets/y_dorada.png';
import '../App.css';
import { useLanguage } from "../idiomaConf/LanguageContext";
import video from "../assets/videoLinea.mp4";



// Main component de la página de inicio
// Método para cambiar el idioma, utilizando el contexto de idioma
function Home() {
    //Usar el idioma
    const { lang, setLang, t } = useLanguage();
        // Función para cambiar idioma
        const changeLangTo = (e: React.ChangeEvent<HTMLSelectElement>) => {
          const selected = e.target.value;
          switch (selected) {
            case "es":
              setLang("es"); // Español
              break;
            case "en":
              setLang("en"); // Inglés
              break;
            case "it":
              setLang("it"); // Italiano
              break;
            case "fr":
              setLang("fr"); // Francés
              break;
            case "de":
              setLang("de"); // Idioma de alemán
              break;
            default:
              setLang("es"); // Idioma por defecto
          }
        };



  // Renderizado del componente, incluyendo el video de fondo,
  // la selección de idioma y los enlaces a otras páginas
  return (
    <div className="App">
      <video autoPlay muted loop className="video">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <nav className="nav-home">
        <select 
              className="control-idioma"
              value={lang} 
              onChange={changeLangTo}
            >
          <option value="es">{t("esp")}</option>
          <option value="en">{t("en")}</option>
          <option value="it">{t("it")}</option>
          <option value="fr">{t("fr")}</option>
          <option value="de">{t("de")}</option>
        </select>
      </nav>
      <div>
        <img src={y_dorada} className="y_dorado" alt="y dorado" />
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