import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import avatar from '../assets/avatar.png';
import y_gris from '../assets/y_gris.png'; 
import { authService } from '../services/auth.service';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.register(username, email, password);

      localStorage.setItem("user", JSON.stringify({
        userId: data.userId, 
        username: data.username
      }));

      setUsername(''); setEmail(''); setPassword('');
      navigate('/menu');

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

export default Register;