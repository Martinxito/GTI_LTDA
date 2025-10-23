import { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMessageCircle,
  FiTool
} from "react-icons/fi";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import { citasService } from "../Servicios/api";

function Mecanico() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasSemana: 0,
    citasCompletadas: 0,
    citasPendientes: 0
  });

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const data = await citasService.getAll();
      setCitas(data);
      
      // Calcular estadísticas
      const hoy = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const finSemana = new Date();
      finSemana.setDate(finSemana.getDate() + (6 - finSemana.getDay()));

      const citasHoy = data.filter(cita => 
        cita && cita.fecha_hora && cita.fecha_hora.startsWith(hoy)
      ).length;

      const citasSemana = data.filter(cita => {
        if (!cita || !cita.fecha_hora) return false;
        const fechaCita = new Date(cita.fecha_hora);
        return fechaCita >= inicioSemana && fechaCita <= finSemana;
      }).length;

      const citasCompletadas = data.filter(cita => 
        cita && cita.estado === 'completada'
      ).length;

      const citasPendientes = data.filter(cita => 
        cita && (cita.estado === 'programada' || cita.estado === 'en_progreso')
      ).length;

      setStats({
        citasHoy,
        citasSemana,
        citasCompletadas,
        citasPendientes
      });
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return '#3b82f6';
      case 'en_progreso': return '#f59e0b';
      case 'completada': return '#10b981';
      case 'cancelada': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const citasHoy = citas.filter(cita => 
    cita && cita.fecha_hora && cita.fecha_hora.startsWith(new Date().toISOString().split('T')[0])
  );

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
        {loading && (
          <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Cargando citas asignadas...</p>
        )}

        {/* Estadísticas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                backgroundColor: "rgba(59, 130, 246, 0.12)",
                color: "#3b82f6",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiCalendar size={22} />
              </span>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {stats.citasHoy}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Citas hoy</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiCheckCircle size={22} />
              </span>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {stats.citasCompletadas}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Completadas</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiClock size={22} />
              </span>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {stats.citasPendientes}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Pendientes</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                backgroundColor: "rgba(139, 92, 246, 0.12)",
                color: "#8b5cf6",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiBarChart2 size={22} />
              </span>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {stats.citasSemana}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Esta semana</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Citas de hoy */}
        <Card title="Citas de hoy" className="mb-6">
          {citasHoy.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#cbd5f5" }}>
                <FiCalendar size={48} />
              </div>
              <div>No tienes citas programadas para hoy</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "1rem" }}>
              {citasHoy.map(cita => (
                <div
                  key={cita.id}
                  style={{
                    padding: "1rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "1.125rem", fontWeight: "600", color: "#1e293b", marginBottom: "0.25rem" }}>
                        {cita.cliente_nombre || "Cliente"}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
                        {cita.vehiculo_info || "Vehículo"} - {cita.servicio_nombre || "Servicio"}
                      </div>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem"
                      }}>
                        <FiClock size={16} />
                        <span>{cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</span>
                      </div>
                    </div>
                    <div>
                      <span style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        backgroundColor: getEstadoColor(cita.estado) + "20",
                        color: getEstadoColor(cita.estado)
                      }}>
                        {cita.estado}
                      </span>
                    </div>
                  </div>
                  {cita.observaciones && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "0.875rem",
                        color: "#64748b",
                        fontStyle: "italic",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem"
                      }}
                    >
                      <FiMessageCircle size={16} />
                      <span>{cita.observaciones}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximas citas */}
        <Card title="Próximas citas">
          {citas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#cbd5f5" }}>
                <FiCalendar size={48} />
              </div>
              <div>No hay citas programadas</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {citas.slice(0, 5).map(cita => (
                <div
                  key={cita.id}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor: "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b" }}>
                        {cita.cliente_nombre || "Cliente"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {cita.fecha_hora ? `${new Date(cita.fecha_hora).toLocaleDateString('es-ES')} - ${new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                      </div>
                    </div>
                    <span style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      backgroundColor: getEstadoColor(cita.estado) + "20",
                      color: getEstadoColor(cita.estado)
                    }}>
                      {cita.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Mecanico;