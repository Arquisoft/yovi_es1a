import { Link } from "react-router-dom";
import reactLogo from '../assets/react.svg'
import y_dorada from '../assets/y_dorada.png';
import '../App.css';

function Home() {
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

      <h2>Pantalla inicial de Game Y</h2>
      <h3>Escoja la opción deseada</h3>     
      <Link to="/register">
        <button>Crear cuenta</button>
      </Link>
      
      <Link to="/login">
        <button>Iniciar sesión</button>
      </Link>
      
      <Link to="/botTester">
        <button>BotTester</button>
      </Link>
      
    </div>
  );
}

//      <BotTester />  {/* Temporary component to test the connection with the Rust Bot (port 4000) */}

export default Home;
