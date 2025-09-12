import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RutaPrivada({ children, rol, roles }) {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc"
      }}>
        <div style={{
          textAlign: "center",
          padding: "2rem"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #e2e8f0",
            borderTop: "4px solid #2563eb",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }}></div>
          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>
            Verificando autenticación...
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirige al login
  if (!user) return <Navigate to="/" />;

  // Si se especifica un rol único y no coincide, redirige al login
  if (rol && user.rol !== rol) return <Navigate to="/" />;

  // Si se especifican múltiples roles y el usuario no tiene ninguno, redirige al login
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" />;

  return children;
}

export default RutaPrivada;