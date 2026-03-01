import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Estadisticas from './pages/Estadisticas';
import Ayuda from "./pages/Ayuda";
import ConfiguracionJuego from './pages/ConfiguracionJuego';

import BotTester from './components/BotTester'; 

import './App.css';
import Game from "./pages/Game";


function App() {

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*Private routes */}
      <Route path="/partida" element={<Game />} />
      <Route path="/jugar" element={<ConfiguracionJuego />} />
      <Route path="/estadisticas" element={<Estadisticas />} />
      <Route path="/ayuda" element={<Ayuda />} />

      {/* Routes for testing */}
      <Route path="/botTester" element={<BotTester />} />
      
      {/* Rout 404  */}
      <Route path="*" element={<h1>404 - Page not found</h1>} />
    </Routes>
  );
}

export default App;