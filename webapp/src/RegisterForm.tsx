import React, { useState } from 'react';
import avatar from './img/avatar.png';
import y_gris from './img/y_gris.png';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setResponseMessage(null);
    setError(null);

    // Validación específica para cada campo
    if (!username.trim()) {
      setError('Please enter a username');  // <-- CAMBIO AQUÍ
      return;
    }
    
    if (!email.trim()) {
      setError('Please enter an email');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API_URL}/createuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify({
          userId: data.userId, 
          username: data.username
        }));
        setResponseMessage(data.message);
        setUsername('');
        setEmail('');
        setPassword('');
        navigate('/menu');
      } else {
        setError(data.error || 'Server error');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
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
          <h2>Crea una cuenta</h2>
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {loading ? 'Entering...' : 'Lets go!'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
  ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Inicia sesión</Link>
          </div>
          {responseMessage && (
            <div className="success-message" style={{ marginTop: 12, color: 'green' }}>
              {responseMessage}
            </div>
          )}

          {error && (
            <div className="error-message" style={{ marginTop: 12, color: 'red' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;