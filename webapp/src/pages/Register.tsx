import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useLanguage } from '../idiomaConf/LanguageContext';
import AuthForm from '../components/AuthForm';
import NavBar from '../components/NavBar';
import y_gris from '../assets/y_gris.png'; 
import avatar from '../assets/avatar.png'; 
import "./Register.css"; 

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (username: string, password: string, email?: string) => {
    setError(null);
    if (!username || !password || !email) {
      setError("Please fill all fields");
      return;
    }

    try {
      const data = await authService.register(username, email, password);
      localStorage.setItem("user", JSON.stringify({
        userId: data.userId, 
        username: data.username
      }));
      
      setWelcomeUser(data.username);
      setTimeout(() => navigate('/configureGame'), 1500);

    } catch (err: any) {
      const message = err.response?.data?.error || err.message || "An error occurred";
      setError(message);
    }
  };

  return (
    <>
      <NavBar activeTab="register" />
      
      {welcomeUser ? (
        <div className="welcome-overlay">
          <h1 className="welcome-text">
            {t("bienvenido")}, <br />
            <span className="user-neon">{welcomeUser}</span>
          </h1>
          <div className="loader-line"></div>
        </div>
      ) : (
        /* Contenedor ajustado al alto de la pantalla para evitar scroll */
        <div className="RegisterForm" style={{ 
          height: 'calc(100vh - 60px)', 
          marginTop: '60px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          overflow: 'hidden' 
        }}>
          
          <img 
            src={y_gris} 
            className="y_gris" 
            alt="logo-y" 
            style={{ maxHeight: '65vh', width: 'auto', objectFit: 'contain' }} 
          />

          <div className="auth-column" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div className="title-register" style={{ marginBottom: '10px' }}>
              <img src={avatar} className="avatar" alt="icon" style={{ width: '30px', height: '30px' }} />
              <h2 style={{ fontSize: '1.5rem' }}>{t("creaCuent")}</h2>
            </div>

            <div className="auth-card-wrapper" style={{ position: 'relative' }}>
              <AuthForm
                title="" 
                isRegister={true}
                buttonText="Lets go!"
                loadingText="Entering..."
                bottomText={t("siCuenta")}
                bottomLinkText={t("inSes")}
                bottomLinkPath="/login"
                onSubmit={handleRegister}
              />

              {error && (
                <div className="error-message-neon-bottom">
                  ⚠️ {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;