import { FiArrowUpRight, FiCalendar, FiCheckCircle, FiClock, FiTool } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";

function DashboardMecanico() {
  const { user } = useAuth();

  return (
    <div>
      <Menu />
      
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1e293b",
          marginBottom: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <FiTool size={26} color="#2563eb" />
          <span>Panel del mecánico</span>
        </h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          {user?.nombre ? `Listo para trabajar, ${user.nombre}? ` : ""}Aquí encontrarás tus próximas tareas.
        </p>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <FiCalendar size={20} color="#2563eb" />
              <span>Mis citas de hoy</span>
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6", marginBottom: "0.5rem" }}>
              3
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Servicios programados
            </div>
          </div>
          
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <FiCheckCircle size={20} color="#10b981" />
              <span>Servicios completados</span>
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981", marginBottom: "0.5rem" }}>
              12
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Esta semana
            </div>
          </div>
          
          <div style={{
            backgroundColor: "white",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            border: "1px solid #e2e8f0"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <FiClock size={20} color="#f59e0b" />
              <span>Servicios pendientes</span>
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b", marginBottom: "0.5rem" }}>
              5
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Por completar
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          border: "1px solid #e2e8f0"
        }}>
          <h3 style={{
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <FiArrowUpRight size={20} color="#2563eb" />
            <span>Accesos directos</span>
          </h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => window.location.href = "/citas"}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FiCalendar size={18} />
              <span>Ver mis citas</span>
            </button>
            <button
              onClick={() => window.location.href = "/calendario"}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FiClock size={18} />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => window.location.href = "/servicios"}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FiTool size={18} />
              <span>Servicios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardMecanico;
