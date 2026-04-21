import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useLanguage } from '../idiomaConf/LanguageContext';
import AuthForm from '../components/AuthForm';
import NavBar from '../components/NavBar';
import "../styles/global.css";
import "../styles/Register.css";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [welcomeUser, setWelcomeUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (username: string, password: string, email?: string) => {
    setError(null);
    if (!username || !password || !email) {
      setError("Por favor rellena todos los campos");
      return;
    }
    try {
      const data = await authService.register(username, email, password);
      await authService.login(username, password);
      sessionStorage.setItem("user", JSON.stringify({
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
        <AuthForm
          title={t("creaCuent")}
          isRegister={true}
          buttonText="Lets go!"
          loadingText="Entering..."
          bottomText={t("siCuenta")}
          bottomLinkText={t("inSes")}
          bottomLinkPath="/login"
          onSubmit={handleRegister}
          outsideError={error}
        />
      )}
    </>
  );
};

export default Register;
