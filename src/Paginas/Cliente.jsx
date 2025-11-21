import { useState, useEffect, useCallback } from "react";
import {
  FiCalendar,
  FiClipboard,
  FiClock,
  FiDroplet,
  FiMessageCircle,
  FiPlusCircle,
  FiTag,
  FiTruck,
  FiUser
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { citasService, vehiculosService } from "../Servicios/api";

function Cliente() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("citas");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [citasData, vehiculosData] = await Promise.all([
        citasService.getAll(),
        vehiculosService.getByUsuario(user.id)
      ]);

      // Filtrar citas del usuario actual
      const citasCliente = Array.isArray(citasData) && user
        ? citasData.filter(cita => cita && cita.usuario_id === user.id)
        : [];
      setCitas(citasCliente);

      // Filtrar vehículos del usuario actual
      const vehiculosCliente = Array.isArray(vehiculosData) && user
        ? vehiculosData.filter(vehiculo => vehiculo && vehiculo.usuario_id === user.id)
        : [];
      setVehiculos(vehiculosCliente);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);

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

  const citasPendientes = citas.filter(cita => 
    cita && (cita.estado === 'programada' || cita.estado === 'en_progreso')
  );

  const tabs = [
    { id: "citas", label: "Mis citas", icon: FiCalendar },
    { id: "vehiculos", label: "Mis vehículos", icon: FiTruck },
    { id: "perfil", label: "Mi perfil", icon: FiUser }
  ];

  return (
    <div>
      <Menu />
      
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "700",
          color: "#1e293b",
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem"
        }}>
          <FiUser size={26} color="#2563eb" />
          <span>Panel del cliente</span>
        </h1>

        {/* Estadísticas rápidas */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "999px",
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                color: "#2563eb",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiCalendar size={20} />
              </span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {citasHoy.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Citas hoy</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "999px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiClock size={20} />
              </span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {citasPendientes.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Pendientes</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "2.75rem",
                height: "2.75rem",
                borderRadius: "999px",
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                color: "#10b981",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiTruck size={20} />
              </span>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {vehiculos.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Vehículos</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Navegación por pestañas */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "2rem"
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "0.75rem 1.5rem",
                border: "none",
                backgroundColor: "transparent",
                color: activeTab === tab.id ? "#2563eb" : "#64748b",
                borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "all 0.15s ease-in-out",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              {(() => {
                const Icon = tab.icon;
                return <Icon size={16} />;
              })()}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ color: "#64748b", marginBottom: "1rem" }}>Cargando información...</p>
        )}

        {/* Contenido de las pestañas */}
        {activeTab === "citas" && (
          <div>
            <Card title="Mis citas">
              {citas.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#cbd5f5" }}>
                    <FiCalendar size={48} />
                  </div>
                  <div>No tienes citas programadas</div>
                  <Button
                    style={{ marginTop: "1rem" }}
                    onClick={() => window.location.href = "/citas"}
                  >
                    <FiPlusCircle size={16} />
                    <span>Programar nueva cita</span>
                  </Button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {citas.map(cita => (
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
                        {cita.servicio_nombre || "Servicio"}
                      </div>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        marginBottom: "0.5rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}>
                        <FiTruck size={16} />
                        <span>{cita.vehiculo_info || "Vehículo"}</span>
                      </div>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}>
                        <FiCalendar size={16} />
                        <span>
                          {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleDateString('es-ES') : 'N/A'}
                        </span>
                        <FiClock size={16} />
                        <span>
                          {cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </span>
                      </div>
                    </div>
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
        </div>
      )}

        {activeTab === "vehiculos" && (
          <div>
            <Card title="Mis vehículos">
              {vehiculos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem", color: "#bbf7d0" }}>
                    <FiTruck size={48} />
                  </div>
                  <div>No tienes vehículos registrados</div>
                  <Button
                    style={{ marginTop: "1rem" }}
                    onClick={() => window.location.href = "/vehiculos"}
                  >
                    <FiPlusCircle size={16} />
                    <span>Registrar vehículo</span>
                  </Button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {vehiculos.map(vehiculo => (
                    <div
                      key={vehiculo.id}
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
                        {vehiculo.marca} {vehiculo.modelo}
                      </div>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}>
                        <FiTag size={16} />
                        <span>Placa: {vehiculo.placa}</span>
                      </div>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        marginBottom: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}>
                        <FiDroplet size={16} />
                        <span>Color: {vehiculo.color}</span>
                      </div>
                      <div style={{
                        fontSize: "0.875rem",
                        color: "#64748b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem"
                      }}>
                        <FiCalendar size={16} />
                        <span>Año: {vehiculo.año}</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => window.location.href = "/historial"}
                    >
                      <FiClipboard size={16} />
                      <span>Ver historial</span>
                    </Button>
                  </div>
                </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "perfil" && (
          <div>
            <Card title="Mi perfil">
              <div style={{ display: "grid", gap: "1rem", maxWidth: "500px" }}>
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>
                    Nombre Completo
                  </div>
                  <div style={{ fontSize: "1rem", color: "#1e293b" }}>
                    {user.nombre} {user.apellido || ""}
                  </div>
                </div>
                
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>
                    Email
                  </div>
                  <div style={{ fontSize: "1rem", color: "#1e293b" }}>
                    {user.email || "No especificado"}
                  </div>
                </div>
                
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>
                    Teléfono
                  </div>
                  <div style={{ fontSize: "1rem", color: "#1e293b" }}>
                    {user.telefono || "No especificado"}
                  </div>
                </div>
                
                <div style={{
                  padding: "1rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0"
                }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "#64748b", marginBottom: "0.25rem" }}>
                    Tipo de usuario
                  </div>
                  <div style={{ fontSize: "1rem", color: "#1e293b" }}>
                    Cliente
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cliente;