import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/ConfiguracionJuego';
import Estadisticas from './pages/Estadisticas';
import Game from './pages/Game';
import Ayuda from "./pages/Ayuda";

import BotTester from './components/BotTester'; 

import './App.css';


function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*Private routes */}
      <Route path="/configuracion" element={<Menu />} />
      <Route path="/game" element={<Game />} />
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