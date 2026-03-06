import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import avatar from '../assets/avatar.png';
import y_gris from '../assets/y_gris.png';
import video from '../assets/videoLinea.mp4';
import { useLanguage } from '../idiomaConf/LanguageContext';

interface AuthFormProps {
  title: string;
  isRegister?: boolean;
  buttonText: string;
  loadingText: string;
  bottomText: string;
  bottomLinkText: string;
  bottomLinkPath: string;
  onSubmit: (username: string, password: string, email?: string) => Promise<void>;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  isRegister = false,
  buttonText,
  loadingText,
  bottomText,
  bottomLinkText,
  bottomLinkPath,
  onSubmit
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { t } = useLanguage();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim() || (isRegister && !email.trim())) {
      setError(isRegister ? 'Please fill all fields' : 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(username, password, isRegister ? email : undefined);
    } catch (err: any) {
      setError(err.message || (isRegister ? 'Network error' : 'Error de conexión con el servidor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="RegisterForm">
      <video autoPlay muted loop className="video">
        <source src={video} type="video/mp4" />
        No se ha podido mostrar el video de fondo
      </video>
      <img src={y_gris} className="y_gris" alt="y gris" />
      
      <div className="form-content">
        <div className="title-register">
          <img src={avatar} className="avatar" alt="avatar" />
          <h2>{title}</h2>
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

          {isRegister && (
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
          )}

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
            {loading ? loadingText : buttonText}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
            {bottomText} <Link to={bottomLinkPath} style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>{bottomLinkText}</Link>
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

export default AuthForm;