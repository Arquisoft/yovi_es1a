import './App.css'
import RegisterForm from './RegisterForm';
import BotTester from './BotTester'; 
import reactLogo from './assets/react.svg'

function App() {
  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h2>Welcome to the Software Arquitecture 2025-2026 course</h2>
      <RegisterForm />

      <BotTester />  {/* Temporary component to test the connection with the Rust Bot (port 4000) */}
    </div>
  );
}

export default App;
