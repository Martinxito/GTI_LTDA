import { FiArrowUpRight, FiCalendar, FiClipboard, FiInfo, FiTruck, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";

function DashboardCliente() {
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
          <FiUser size={26} color="#2563eb" />
          <span>Panel del cliente</span>
        </h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          {user?.nombre ? `Hola, ${user.nombre}. ` : ""}Aquí podrás gestionar tus citas y vehículos.
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
              <span>Mis citas</span>
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6", marginBottom: "0.5rem" }}>
              2
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Programadas esta semana
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
              <FiTruck size={20} color="#10b981" />
              <span>Mis vehículos</span>
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981", marginBottom: "0.5rem" }}>
              1
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Vehículos registrados
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
              <FiClipboard size={20} color="#8b5cf6" />
              <span>Historial</span>
            </h3>
            <div style={{ fontSize: "2rem", fontWeight: "700", color: "#8b5cf6", marginBottom: "0.5rem" }}>
              8
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
              Servicios completados
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
              <span>Mis citas</span>
            </button>
            <button
              onClick={() => window.location.href = "/vehiculos"}
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
              <FiTruck size={18} />
              <span>Mis vehículos</span>
            </button>
            <button
              onClick={() => window.location.href = "/historial"}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#8b5cf6",
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
              <FiClipboard size={18} />
              <span>Historial</span>
            </button>
            <button
              onClick={() => window.location.href = "/calendario"}
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
              <FiCalendar size={18} />
              <span>Calendario</span>
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: "#f0f9ff",
          padding: "1.5rem",
          borderRadius: "12px",
          border: "1px solid #bae6fd",
          marginTop: "2rem"
        }}>
          <h4 style={{
            fontSize: "1rem",
            fontWeight: "600",
            color: "#0369a1",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <FiInfo size={18} />
            <span>Información importante</span>
          </h4>
          <p style={{ fontSize: "0.875rem", color: "#0369a1", margin: 0, lineHeight: "1.5" }}>
            Como cliente, puedes gestionar tus vehículos, programar citas de mantenimiento y revisar el historial de servicios. 
            Si necesitas ayuda, contacta con el taller.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardCliente;
