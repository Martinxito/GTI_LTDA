import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";

function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <Menu />
      
      {/* Contenido principal */}
      <div style={{
        padding: "2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
      <h1 style={{
        fontSize: "2rem",
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: "1rem"
      }}>
        📊 Dashboard
      </h1>
      
      <div style={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "8px",
        boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        border: "1px solid #e2e8f0"
      }}>
        <p style={{
          fontSize: "1.125rem",
          color: "#64748b",
          margin: 0
        }}>
          ¡Bienvenido al sistema de gestión de GTI LTDA!
        </p>
        
        <div style={{
          marginTop: "2rem",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem"
        }}>
          <div style={{
            backgroundColor: "#f0f9ff",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #bae6fd"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#0369a1",
              margin: "0 0 0.5rem 0"
            }}>
              📅 Citas del Día
            </h3>
            <p style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#0369a1",
              margin: 0
            }}>
              5
            </p>
          </div>
          
          <div style={{
            backgroundColor: "#f0fdf4",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #bbf7d0"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#166534",
              margin: "0 0 0.5rem 0"
            }}>
              💰 Ingresos del Mes
            </h3>
            <p style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#166534",
              margin: 0
            }}>
              $2,500,000
            </p>
          </div>
          
          <div style={{
            backgroundColor: "#fef2f2",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #fecaca"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#dc2626",
              margin: "0 0 0.5rem 0"
            }}>
              ⚠️ Stock Bajo
            </h3>
            <p style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#dc2626",
              margin: 0
            }}>
              3
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Dashboard;