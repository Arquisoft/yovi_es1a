import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useLanguage } from '../idiomaConf/LanguageContext';
import AuthForm from '../components/AuthForm';
import NavBar from '../components/NavBar';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleLogin = async (username: string, password: string) => {
    const data = await authService.login(username, password);

    localStorage.setItem("user", JSON.stringify({
      userId: data.userId, 
      username: data.username
    }));
    
    alert(`¡Bienvenido de nuevo, ${data.username}!`);
    navigate('/configureGame');
  };

  return (
  <>
    <NavBar activeTab="login" />
    <AuthForm
      title={t("inSes")}
      buttonText="Log in!"
      loadingText="Entering..."
      bottomText={t("noCuenta")}
      bottomLinkText={t("regAqui")}
      bottomLinkPath="/register"
      onSubmit={handleLogin}
    />
  </>
  );
};

export default Login;