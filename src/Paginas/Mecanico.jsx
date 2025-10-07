import { useState, useEffect } from "react";
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
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1e293b", marginBottom: "0.5rem" }}>
          🔧 Panel del Mecánico
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
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6", marginBottom: "0.5rem" }}>
                📅 {stats.citasHoy}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Citas Hoy
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981", marginBottom: "0.5rem" }}>
                ✅ {stats.citasCompletadas}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Completadas
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b", marginBottom: "0.5rem" }}>
                ⏳ {stats.citasPendientes}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Pendientes
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#8b5cf6", marginBottom: "0.5rem" }}>
                📊 {stats.citasSemana}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Esta Semana
              </div>
            </div>
          </Card>
        </div>

        {/* Citas de hoy */}
        <Card title="📅 Citas de Hoy" className="mb-6">
          {citasHoy.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😴</div>
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
                      <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        🕐 {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
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
                    <div style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#64748b", fontStyle: "italic" }}>
                      💬 {cita.observaciones}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Próximas citas */}
        <Card title="📋 Próximas Citas">
          {citas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📅</div>
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