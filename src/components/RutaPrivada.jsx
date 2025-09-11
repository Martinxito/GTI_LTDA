import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RutaPrivada({ children, rol }) {
  const { user } = useAuth();

  // Si no hay usuario, redirige al login
  if (!user) return <Navigate to="/" />;

  // Si se especifica un rol y no coincide, redirige al login
  if (rol && user.rol !== rol) return <Navigate to="/" />;

  return children;
}

export default RutaPrivada;