import { Navigate, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";

function ProtectedRoute() {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
