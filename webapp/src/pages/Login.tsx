import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import avatar from '../assets/avatar.png';
import y_gris from '../assets/y_gris.png';
import { authService } from '../services/auth.service';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(username, password);

      localStorage.setItem("user", JSON.stringify({
        userId: data.userId, 
        username: data.username
      }));
      
      alert(`¡Bienvenido de nuevo, ${data.username}!`);
      navigate('/menu');

    } catch (err: any) {
      setError(err.message || 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="RegisterForm">
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