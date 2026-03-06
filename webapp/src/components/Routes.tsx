import { Navigate, Outlet, useLocation } from 'react-router-dom';

const checkAuth = () => {
  const user = localStorage.getItem("user");
  return !!user; 
};

const UnloginRoute = () => {
  if (!checkAuth()) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const GameAccessRoute = () => {
  const location = useLocation();
  if (!checkAuth()) {
    return <Navigate to="/login" replace />;
  }
  const hasConfig = location.state && location.state.tamanoSeleccionado;
  if (!hasConfig) {
    return <Navigate to="/configureGame" replace />;
  }

  return <Outlet />;
};

export { UnloginRoute, GameAccessRoute };
