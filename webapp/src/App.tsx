import './App.css';
import RegisterForm from './RegisterForm';
import BotTester from './BotTester'; 
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Login from './Login';
import Tablero from './Tablero';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/botTester" element={<BotTester />} />
      <Route path="/login" element={<Login />} />
      <Route path="/game" element={<Tablero />} />
    </Routes>
  );
}

export default App;
