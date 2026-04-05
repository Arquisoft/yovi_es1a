import y_dorada from '../assets/y_dorada.png';
import "../styles/global.css";
import { useLanguage } from "../idiomaConf/LanguageContext";
import video from "../assets/videoLinea.mp4";
import NavBar from '../components/NavBar'; 

function Home() {
  const { t } = useLanguage();

  return (
    <div className="App">
      <NavBar activeTab="home" />

      <video autoPlay muted loop className="videoIN">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      
      <div className="home-content">
        <div>
          <img src={y_dorada} className="y_dorado" alt="y dorado" />
        </div>
        
        <h1>{t("bienvenido")}</h1>
      </div>
    </div>
  );
}

export default Home;