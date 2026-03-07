import reactLogo from '../assets/react.svg'
import y_dorada from '../assets/y_dorada.png';
import '../App.css';
import { useLanguage } from "../idiomaConf/LanguageContext";
import video from "../assets/videoLinea.mp4";
import NavBar from "../components/NavBar";


function Home() {
    const { t } = useLanguage();
  return (
    <div className="App">
      <NavBar activeTab="home" />
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
      
    </div>
  );
}

//      <BotTester />  {/* Temporary component to test the connection with the Rust Bot (port 4000) */}

export default Home;
