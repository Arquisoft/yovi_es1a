import { Navigate, Outlet, useLocation } from 'react-router-dom';

const checkAuth = () => {
  const user = sessionStorage.getItem("user");
  if (!user || user === "null" || user === "undefined") return false; 
  return true;
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
