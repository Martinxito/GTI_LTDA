import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      // Redirigir según el rol del usuario
      switch (user.rol) {
        case 'jefe_taller':
          navigate("/dashboard");
          break;
        case 'mecanico':
          navigate("/dashboard-mecanico");
          break;
        case 'cliente':
          navigate("/dashboard-cliente");
          break;
        default:
          navigate("/dashboard");
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(usuario, password);
      if (result.success) {
        // La redirección se manejará en el useEffect
        console.log("Login exitoso, redirigiendo...");
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error de conexión. Verifica que el backend esté ejecutándose.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación inicial
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8fafc",
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{
          textAlign: "center",
          marginBottom: "2rem",
          color: "#1e293b",
          fontSize: "1.5rem",
          fontWeight: "700"
        }}>
          🔧 GTI LTDA
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "0.75rem",
            borderRadius: "6px",
            marginBottom: "1rem",
            fontSize: "0.875rem"
          }}>
            ❌ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                backgroundColor: "white",
                color: "#1e293b"
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "0.5rem"
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                backgroundColor: "white",
                color: "#1e293b"
              }}
              required
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              backgroundColor: isLoading ? "#94a3b8" : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.15s ease-in-out",
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? "⏳ Iniciando sesión..." : "🚀 Iniciar Sesión"}
          </button>
        </form>
        
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          backgroundColor: "#f0f9ff",
          borderRadius: "6px",
          fontSize: "0.875rem",
          color: "#0369a1"
        }}>
          <strong>Usuarios de prueba:</strong><br/>
          • Jefe Taller: admin / admin123<br/>
          • Mecánico: mecanico / mecanico123<br/>
          • Cliente: cliente / cliente123
        </div>
      </div>
    </div>
  );
}

export default Login;