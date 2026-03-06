import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useLanguage } from '../idiomaConf/LanguageContext';
import AuthForm from '../components/AuthForm';
import NavBar from '../components/NavBar';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleRegister = async (username: string, password: string, email?: string) => {
    if (!email) throw new Error("Email is required");
    
    const data = await authService.register(username, email, password);

    localStorage.setItem("user", JSON.stringify({
      userId: data.userId, 
      username: data.username
    }));

    alert(`¡Usuario registrado correctamente!`);
    navigate('/jugar');
  };

  return (
    <>
    <NavBar activeTab="" />
    <AuthForm
      title={t("creaCuent")}
      isRegister={true}
      buttonText="Lets go!"
      loadingText="Entering..."
      bottomText={t("siCuenta")}
      bottomLinkText={t("inSes")}
      bottomLinkPath="/login"
      onSubmit={handleRegister}
    />
  </>  
  );
};

export default Register;