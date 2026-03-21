import { Routes, Route } from "react-router-dom";
import { UnloginRoute, GameAccessRoute } from './components/Routes';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Statistics from './pages/Statistics';
import Help from "./pages/Help";
import GameSettings from './pages/GameSettings';
import About from './pages/About';
import Clanes from './pages/Clan';
import Ranking from './pages/Ranking';

import BotTester from './components/BotTester'; 

import './App.css';
import Game from "./pages/Game";
import Multiplayer from "./pages/Multiplayer";


function App() {

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<About />} />
      <Route path="/multiplayer" element={<Multiplayer />} />

      {/*Private routes */}
      <Route element={<UnloginRoute />}>
        <Route path="/configureGame" element={<GameSettings />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/ranking/:type" element={<Ranking />} />
        <Route path="/help" element={<Help />} />
        <Route path="/botTester" element={<BotTester />} />
        <Route path="/clanes" element={<Clanes />} />

        <Route element={<GameAccessRoute />}>
          <Route path="/game" element={<Game />} />
        </Route>
      </Route>

      {/* Routes for testing */}
      <Route path="/botTester" element={<BotTester />} />
      
      {/* Rout 404  */}
      <Route path="*" element={<h1>404 - Page not found</h1>} />
    </Routes>
  );
}

export default App;