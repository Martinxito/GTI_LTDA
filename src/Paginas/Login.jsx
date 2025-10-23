import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertTriangle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "2.5rem",
    boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.35)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
  },
  header: {
    marginBottom: "2.5rem",
    textAlign: "center",
  },
  brand: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#475569",
  },
  label: {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: "0.5rem",
  },
  input: {
    width: "100%",
    padding: "0.85rem 1rem",
    fontSize: "1rem",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
  },
  button: {
    width: "100%",
    padding: "0.85rem 1.25rem",
    fontSize: "1rem",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
  },
  error: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    padding: "0.85rem 1rem",
    borderRadius: "10px",
    fontSize: "0.9rem",
    marginBottom: "1.5rem",
  },
  helper: {
    marginTop: "2rem",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    padding: "1.25rem",
    border: "1px solid rgba(148, 163, 184, 0.2)",
  },
  helperTitle: {
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#0f172a",
    marginBottom: "0.75rem",
  },
  helperList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.85rem",
    color: "#475569",
  },
};

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      switch (user.rol) {
        case "jefe_taller":
          navigate("/dashboard");
          break;
        case "mecanico":
          navigate("/dashboard-mecanico");
          break;
        case "cliente":
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
      if (!result.success) {
        setError(result.error || "No fue posible iniciar sesión");
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError("Error de conexión. Verifica que el backend esté ejecutándose.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #e2e8f0",
              borderTop: "4px solid #2563eb",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <div style={{ color: "#64748b", fontSize: "0.875rem" }}>Cargando…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.brand}>GTI LTDA</div>
          <p style={styles.subtitle}>Plataforma de gestión integral para talleres automotrices</p>
        </div>

        {error && (
          <div style={styles.error}>
            <FiAlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={styles.label}>Usuario</label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingresa tu usuario"
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              style={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonDisabled : {}),
            }}
          >
            {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>

        <div style={styles.helper}>
          <div style={styles.helperTitle}>Usuarios de prueba</div>
          <ul style={styles.helperList}>
            <li>Jefe de taller: admin / admin123</li>
            <li>Mecánico: mecanico / mecanico123</li>
            <li>Cliente: cliente / cliente123</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Login;
