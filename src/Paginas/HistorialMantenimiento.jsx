import { useState, useEffect } from "react";
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
  const [citas, setCitas] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedVehiculo, setSelectedVehiculo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiculosData, citasData] = await Promise.all([
        vehiculosService.getAll(),
        citasService.getAll()
      ]);
      
      // Filtrar vehículos según el rol del usuario
      let vehiculosFiltrados = vehiculosData;
      if (user.rol === 'cliente') {
        vehiculosFiltrados = vehiculosData.filter(vehiculo => vehiculo.cliente_id === user.id);
      }
      
      setVehiculos(Array.isArray(vehiculosFiltrados) ? vehiculosFiltrados : []);
      setCitas(Array.isArray(citasData) ? citasData : []);
      
      // Crear historial combinando citas completadas con información de vehículos
      const historialCompleto = citasData
        .filter(cita => cita && cita.estado === 'completada' && cita.fecha_hora)
        .map(cita => {
          const vehiculo = vehiculosData.find(v => v && v.id === cita.vehiculo_id);
          return {
            ...cita,
            vehiculo_info: vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : 'N/A',
            cliente_nombre: vehiculo ? `${vehiculo.cliente_nombre || 'Cliente'}` : 'N/A'
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
  };

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
    { key: "cliente_nombre", label: "Cliente" },
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
          📋 Ver Historial
        </Button>
      )
    }
  ];

  return (
    <div>
      <Menu />
      
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1e293b", marginBottom: "2rem" }}>
          📋 Historial de Mantenimiento
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
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981", marginBottom: "0.5rem" }}>
                ✅ {historial.length}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Servicios Completados
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6", marginBottom: "0.5rem" }}>
                🚗 {vehiculos.length}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Vehículos Registrados
              </div>
            </div>
          </Card>
          
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b", marginBottom: "0.5rem" }}>
                📅 {historial.filter(item => {
                  const fechaServicio = new Date(item.fecha_hora);
                  const haceUnMes = new Date();
                  haceUnMes.setMonth(haceUnMes.getMonth() - 1);
                  return fechaServicio >= haceUnMes;
                }).length}
              </div>
              <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                Último Mes
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de vehículos */}
        <Card title="🚗 Vehículos" className="mb-6">
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
            title={`📋 Historial - ${selectedVehiculo.marca} ${selectedVehiculo.modelo} (${selectedVehiculo.placa})`}
            className="mb-6"
          >
            <div style={{ marginBottom: "1rem" }}>
              <Button
                variant="secondary"
                onClick={() => setSelectedVehiculo(null)}
              >
                ⬅️ Volver a Lista
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
                        <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#f59e0b" }}>
                          📅
                        </div>
                        <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                          Último: {new Date(stats.ultimoServicio.fecha_hora).toLocaleDateString('es-ES')}
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
          <Card title="📋 Historial Completo">
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