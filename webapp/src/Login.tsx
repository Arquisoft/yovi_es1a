import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import avatar from './img/avatar.png';
import y_gris from './img/y_gris.png';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }) 
      });

      const data = await res.json();
      
      if (res.ok) {
          localStorage.setItem("user", JSON.stringify({
            userId: data.userId, 
            username: data.username
          }));
        console.log("¡Conectado con éxito!", data.message);
        alert(`¡Bienvenido de nuevo, ${data.username}!`);
        
        //navigate('/botTester');
        navigate('/menu');

        
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (err: any) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="RegisterForm"> {/* Usamos la misma clase envoltorio para heredar tu CSS */}
      <img src={y_gris} className="y_gris" alt="y gris" />
      <div className="form-content">
        <div className="title-register">
          <img src={avatar} className="avatar" alt="avatar" />
          <h2>Inicia Sesión</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}> 
            {loading ? 'Entering...' : 'Log in!'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Regístrate aquí</Link>
          </div>
          
          {error && (
            <div className="error-message" style={{ marginTop: 12, color: 'red', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login;