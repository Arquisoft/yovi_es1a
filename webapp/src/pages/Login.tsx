import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useLanguage } from '../idiomaConf/LanguageContext';
import AuthForm from '../components/AuthForm';
import NavBar from '../components/NavBar';
import "../styles/global.css";
import "../styles/Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string) => {
    setError(null);
    try {
      const data = await authService.login(username, password);
      localStorage.setItem("user", JSON.stringify({
        userId: data.userId, 
        username: data.username
      }));
      setWelcomeUser(data.username);
      setTimeout(() => navigate('/configureGame'), 1500);
    } catch (err: any) {
      console.error("Error al loguear:", err);
      setError(t("errorLogin") || "Usuario o contraseña incorrectos");
    }
  };

  return (
    <>
      <NavBar activeTab="login" />
      {welcomeUser ? (
        <div className="welcome-overlay">
          <h1 className="welcome-text">
            {t("bienvenido")}, <br />
            <span className="user-neon">{welcomeUser}</span>
          </h1>
          <div className="loader-line"></div>
        </div>
      ) : (
        <AuthForm
          title={t("inSes")}
          buttonText="Log in!"
          loadingText="Entering..."
          bottomText={t("noCuenta")}
          bottomLinkText={t("regAqui")}
          bottomLinkPath="/register"
          onSubmit={handleLogin}
          outsideError={error}
        />
      )}
    </>
  );
};

export default Login;
