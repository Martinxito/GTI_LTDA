import { useEffect, useState } from "react";
import { FiAlertTriangle, FiCalendar, FiDollarSign } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";
import { citasService, inventarioService } from "../Servicios/api";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    citasHoy: 0,
    ingresosMes: 0,
    stockBajo: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const hoy = new Date().toISOString().split("T")[0];

        const [citasHoy, todasLasCitas, inventario] = await Promise.all([
          citasService.getByDate(hoy),
          citasService.getAll(),
          inventarioService.getAll()
        ]);

        const citasDelDia = Array.isArray(citasHoy) ? citasHoy.length : 0;

        const ingresosMes = (todasLasCitas || []).reduce((total, cita) => {
          const fechaCita = cita.fecha_cita || cita.fecha_hora?.split("T")[0];

          if (!fechaCita) return total;

          const fecha = new Date(fechaCita);
          const hoyDate = new Date();
          const mismoMes =
            fecha.getMonth() === hoyDate.getMonth() &&
            fecha.getFullYear() === hoyDate.getFullYear();
          const estado = (cita.estado || "").toLowerCase();
          const completada = estado === "completada" || estado === "completado";

          if (!mismoMes || !completada) return total;

          const monto = parseFloat(cita.costo_total || cita.servicio_precio || 0);
          return total + (Number.isNaN(monto) ? 0 : monto);
        }, 0);

        const productosConStockBajo = (inventario || []).filter((item) => {
          const cantidad = parseInt(item.cantidad ?? 0, 10);
          const minimo = parseInt(item.cantidad_minima ?? 5, 10);
          return cantidad <= minimo;
        }).length;

        setStats({
          citasHoy: citasDelDia,
          ingresosMes,
          stockBajo: productosConStockBajo
        });
      } catch (error) {
        console.error("Error al cargar el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
        Panel General
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
          ¡Bienvenido{user?.nombre ? `, ${user.nombre}` : ""} al sistema de gestión de GTI LTDA!
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
            borderRadius: "12px",
            border: "1px solid #bae6fd",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#0369a1",
                margin: 0
              }}>
                Citas del día
              </h3>
              <FiCalendar size={24} color="#0369a1" />
            </div>
            <p style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#0369a1",
              margin: 0
            }}>
              {loading ? "-" : stats.citasHoy}
            </p>
            <span style={{ color: "#0369a1", fontSize: "0.85rem" }}>Clientes agendados para hoy</span>
          </div>

          <div style={{
            backgroundColor: "#f0fdf4",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #bbf7d0",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#166534",
                margin: 0
              }}>
                Ingresos del mes
              </h3>
              <FiDollarSign size={24} color="#166534" />
            </div>
            <p style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#166534",
              margin: 0
            }}>
              {loading ? "-" : `$${Math.round(stats.ingresosMes).toLocaleString()}`}
            </p>
            <span style={{ color: "#166534", fontSize: "0.85rem" }}>Servicios completados en el mes</span>
          </div>

          <div style={{
            backgroundColor: "#fef2f2",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid #fecaca",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#dc2626",
                margin: 0
              }}>
                Stock bajo
              </h3>
              <FiAlertTriangle size={24} color="#dc2626" />
            </div>
            <p style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#dc2626",
              margin: 0
            }}>
              {loading ? "-" : stats.stockBajo}
            </p>
            <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>Productos requieren reposición</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default Dashboard;