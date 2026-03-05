import { Routes, Route } from "react-router-dom";

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Statistics from './pages/Statistics';
import Help from "./pages/Help";
import ConfiguracionJuego from './pages/GameSettings';

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
      <Route path="/game" element={<Game />} />
      <Route path="/configureGame" element={<ConfiguracionJuego />} />
      <Route path="/statistics" element={<Statistics />} />
      <Route path="/help" element={<Help />} />

      {/* Routes for testing */}
      <Route path="/botTester" element={<BotTester />} />
      
      {/* Rout 404  */}
      <Route path="*" element={<h1>404 - Page not found</h1>} />
    </Routes>
  );
}

export default App;