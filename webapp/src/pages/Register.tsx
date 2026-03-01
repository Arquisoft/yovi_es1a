import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import avatar from '../assets/avatar.png';
import y_gris from '../assets/y_gris.png'; 
import { authService } from '../services/auth.service';
import { useLanguage } from "../idiomaConf/LanguageContext";

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

    //Usar el idioma
    const { lang, setLang, t } = useLanguage();

  return (
    <div className="RegisterForm">
      <img src={y_gris} className="y_gris" alt="y gris" />
      <div className="form-content">
        <div className="title-register">
          <img src={avatar} className="avatar" alt="avatar" />
          <h2>{t("creaCuent")}</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">{t("user")}</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t("email")}</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t("contra")}</label>
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
            {t("siCuenta")} <Link to="/login" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>{t("inSes")}</Link>
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