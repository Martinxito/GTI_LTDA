import { useState, useEffect, useCallback } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiClipboard,
  FiClock,
  FiTruck
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { vehiculosService, citasService } from "../Servicios/api";

function HistorialMantenimiento() {
  const { user } = useAuth();
  const [vehiculos, setVehiculos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);

  const loadData = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      setLoading(true);
      const vehiculosRequest = user.rol === 'cliente'
        ? vehiculosService.getByUsuario(user.id)
        : vehiculosService.getAll();

      const [vehiculosData, citasData] = await Promise.all([
        vehiculosRequest,
        citasService.getAll()
      ]);

      // Filtrar vehículos según el rol del usuario
      let vehiculosFiltrados = vehiculosData;
      if (user.rol === 'cliente') {
        vehiculosFiltrados = vehiculosData.filter(vehiculo => vehiculo.usuario_id === user.id);
      }

      setVehiculos(Array.isArray(vehiculosFiltrados) ? vehiculosFiltrados : []);

      // Crear historial combinando citas completadas con información de vehículos
      const historialCompleto = citasData
        .filter(cita => cita && cita.estado === 'completada' && cita.fecha_hora)
        .map(cita => {
          const vehiculo = vehiculosData.find(v => v && v.id === cita.vehiculo_id);
          return {
            ...cita,
            vehiculo_info: vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : 'N/A',
            cliente_nombre: vehiculo ? `${vehiculo.usuario_nombre || 'Usuario'}` : 'N/A'
          };
        })
        .sort((a, b) => {
          if (!a.fecha_hora || !b.fecha_hora) return 0;
          return new Date(b.fecha_hora) - new Date(a.fecha_hora);
        });
      
      setHistorial(historialCompleto);
    } catch (error) {
      setError("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getVehiculoHistorial = (vehiculoId) => {
    return historial.filter(item => item.vehiculo_id === vehiculoId);
  };

  const getEstadisticasVehiculo = (vehiculoId) => {
    const historialVehiculo = getVehiculoHistorial(vehiculoId);
    const totalServicios = historialVehiculo.length;
    const ultimoServicio = historialVehiculo[0];
    const serviciosUltimoMes = historialVehiculo.filter(item => {
      if (!item || !item.fecha_hora) return false;
      const fechaServicio = new Date(item.fecha_hora);
      const haceUnMes = new Date();
      haceUnMes.setMonth(haceUnMes.getMonth() - 1);
      return fechaServicio >= haceUnMes;
    }).length;

    return {
      totalServicios,
      ultimoServicio,
      serviciosUltimoMes
    };
  };

  const columns = [
    { 
      key: "fecha_hora", 
      label: "Fecha",
      render: (item) => new Date(item.fecha_hora).toLocaleDateString('es-ES')
    },
    { key: "vehiculo_info", label: "Vehículo" },
    { key: "servicio_nombre", label: "Servicio Realizado" },
    { key: "usuario_nombre", label: "Usuario" },
    { 
      key: "observaciones", 
      label: "Observaciones",
      render: (item) => item.observaciones || "Sin observaciones"
    }
  ];

  const vehiculosColumns = [
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo" },
    { key: "año", label: "Año" },
    { key: "placa", label: "Placa" },
    { key: "color", label: "Color" },
    {
      key: "estadisticas",
      label: "Servicios",
      render: (vehiculo) => {
        const stats = getEstadisticasVehiculo(vehiculo.id);
        return (
          <div style={{ fontSize: "0.875rem" }}>
            <div>Total: {stats.totalServicios}</div>
            <div style={{ color: "#3b82f6" }}>Último mes: {stats.serviciosUltimoMes}</div>
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "Acciones",
      render: (vehiculo) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setSelectedVehiculo(vehiculo)}
        >
          <FiClipboard size={16} />
          <span>Ver historial</span>
        </Button>
      )
    }
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
          <FiClipboard size={26} color="#2563eb" />
          <span>Historial de mantenimiento</span>
        </h1>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}

        {/* Estadísticas generales */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem"
        }}>
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
                  {historial.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Servicios completados</div>
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
              <span style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "999px",
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                color: "#2563eb",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiTruck size={22} />
              </span>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {vehiculos.length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Vehículos registrados</div>
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
                <FiCalendar size={22} />
              </span>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: "700", color: "#1e293b", lineHeight: 1 }}>
                  {historial.filter(item => {
                    const fechaServicio = new Date(item.fecha_hora);
                    const haceUnMes = new Date();
                    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
                    return fechaServicio >= haceUnMes;
                  }).length}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#64748b" }}>Servicios último mes</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de vehículos */}
        <Card title="Vehículos" className="mb-6">
          <Table
            data={vehiculos}
            columns={vehiculosColumns}
            loading={loading}
            emptyMessage="No hay vehículos registrados"
          />
        </Card>

        {/* Historial detallado */}
        {selectedVehiculo ? (
          <Card
            title={`Historial - ${selectedVehiculo.marca} ${selectedVehiculo.modelo} (${selectedVehiculo.placa})`}
            className="mb-6"
          >
            <div style={{ marginBottom: "1rem" }}>
              <Button
                variant="secondary"
                onClick={() => setSelectedVehiculo(null)}
              >
                <FiArrowLeft size={16} />
                <span>Volver a la lista</span>
              </Button>
            </div>
            
            {(() => {
              const historialVehiculo = getVehiculoHistorial(selectedVehiculo.id);
              const stats = getEstadisticasVehiculo(selectedVehiculo.id);
              
              return (
                <div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1.5rem"
                  }}>
                    <div style={{
                      padding: "1rem",
                      backgroundColor: "#f0f9ff",
                      borderRadius: "8px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#3b82f6" }}>
                        {stats.totalServicios}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Total Servicios
                      </div>
                    </div>
                    
                    <div style={{
                      padding: "1rem",
                      backgroundColor: "#f0fdf4",
                      borderRadius: "8px",
                      textAlign: "center"
                    }}>
                      <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                        {stats.serviciosUltimoMes}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                        Último Mes
                      </div>
                    </div>
                    
                    {stats.ultimoServicio && (
                      <div style={{
                        padding: "1rem",
                        backgroundColor: "#fffbeb",
                        borderRadius: "8px",
                        textAlign: "center"
                      }}>
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "2.5rem",
                          height: "2.5rem",
                          borderRadius: "999px",
                          backgroundColor: "rgba(245, 158, 11, 0.15)",
                          color: "#f59e0b",
                          marginBottom: "0.5rem"
                        }}>
                          <FiCalendar size={18} />
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                          Último servicio: {new Date(stats.ultimoServicio.fecha_hora).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    )}
                  </div>

                  <Table
                    data={historialVehiculo}
                    columns={columns}
                    loading={loading}
                    emptyMessage="No hay servicios registrados para este vehículo"
                  />
                </div>
              );
            })()}
          </Card>
        ) : (
          <Card title="Historial completo">
            <Table
              data={historial}
              columns={columns}
              loading={loading}
              emptyMessage="No hay servicios completados registrados"
            />
          </Card>
        )}
      </div>
    </div>
  );
}

export default HistorialMantenimiento;