import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiEdit,
  FiPlus,
  FiSave,
  FiTrash2,
  FiX
} from "react-icons/fi";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { citasService, vehiculosService, serviciosService, usuariosService } from "../Servicios/api";

function GestionCitas() {
  const [citas, setCitas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCita, setEditingCita] = useState(null);

  const [formData, setFormData] = useState({
    cliente_id: "",
    vehiculo_id: "",
    servicio_id: "",
    fecha_hora: "",
    estado: "programada",
    observaciones: ""
  });

  useEffect(() => {
    loadCitas();
    loadUsuarios();
    loadVehiculos();
    loadServicios();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const data = await citasService.getAll();
      setCitas(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error al cargar citas: " + error.message);
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const loadVehiculos = async () => {
    try {
      const data = await vehiculosService.getAll();
      setVehiculos(data);
    } catch (error) {
      console.error("Error al cargar vehículos:", error);
    }
  };

  const loadServicios = async () => {
    try {
      const data = await serviciosService.getAll();
      setServicios(data);
    } catch (error) {
      console.error("Error al cargar servicios:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingCita) {
        await citasService.update(editingCita.id, formData);
        setSuccess("Cita actualizada correctamente");
      } else {
        await citasService.create(formData);
        setSuccess("Cita creada correctamente");
      }
      
      setShowForm(false);
      setEditingCita(null);
      setFormData({ cliente_id: "", vehiculo_id: "", servicio_id: "", fecha_hora: "", estado: "programada", observaciones: "" });
      loadCitas();
    } catch (error) {
      setError("Error al guardar cita: " + error.message);
    }
  };

  const handleEdit = (cita) => {
    setEditingCita(cita);
    setFormData({
      cliente_id: cita.cliente_id || "",
      vehiculo_id: cita.vehiculo_id || "",
      servicio_id: cita.servicio_id || "",
      fecha_hora: cita.fecha_hora ? new Date(cita.fecha_hora).toISOString().slice(0, 16) : "",
      estado: cita.estado || "programada",
      observaciones: cita.observaciones || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      try {
        await citasService.delete(id);
        setSuccess("Cita eliminada correctamente");
        loadCitas();
      } catch (error) {
        setError("Error al eliminar cita: " + error.message);
      }
    }
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuario.find(c => c.id === usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : "N/A";
  };

  const getVehiculoInfo = (vehiculoId) => {
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo} - ${vehiculo.placa}` : "N/A";
  };

  const getServicioNombre = (servicioId) => {
    const servicio = servicios.find(s => s.id === servicioId);
    return servicio ? servicio.nombre : "N/A";
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

  const estados = [
    { value: "programada", label: "Programada" },
    { value: "en_progreso", label: "En Progreso" },
    { value: "completada", label: "Completada" },
    { value: "cancelada", label: "Cancelada" }
  ];

  const columns = [
    { 
      key: "fecha_hora", 
      label: "Fecha y Hora",
      render: (cita) => cita.fecha_hora ? new Date(cita.fecha_hora).toLocaleString('es-ES') : 'N/A'
    },
    {
      key: "usuario_nombre",
      label: "Usuario",
      render: (cita) => getUsuarioNombre(cita.cliente_id)
    },
    {
      key: "vehiculo_info",
      label: "Vehículo",
      render: (cita) => getVehiculoInfo(cita.vehiculo_id)
    },
    {
      key: "servicio_nombre",
      label: "Servicio",
      render: (cita) => getServicioNombre(cita.servicio_id)
    },
    {
      key: "estado",
      label: "Estado",
      render: (cita) => (
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
      )
    },
    {
      key: "actions",
      label: "Acciones",
      render: (cita) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(cita)}
          >
            <FiEdit size={16} />
            <span>Editar</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(cita.id)}
          >
            <FiTrash2 size={16} />
            <span>Eliminar</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Menu />
      
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            <FiCalendar size={26} color="#2563eb" />
            <span>Gestión de citas</span>
          </h1>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingCita(null);
              setFormData({ cliente_id: "", vehiculo_id: "", servicio_id: "", fecha_hora: "", estado: "programada", observaciones: "" });
            }}
          >
            <FiPlus size={16} />
            <span>Nueva cita</span>
          </Button>
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

        {showForm && (
          <Card title={editingCita ? "Editar Cita" : "Nueva Cita"} className="mb-6">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    Usuario
                  </label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      color: "#1e293b"
                    }}
                    required
                  >
                    <option value="">Seleccionar usuario</option>
                    {usuarios.map(usuario => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    Vehículo
                  </label>
                  <select
                    value={formData.vehiculo_id}
                    onChange={(e) => setFormData({ ...formData, vehiculo_id: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      color: "#1e293b"
                    }}
                    required
                  >
                    <option value="">Seleccionar vehículo</option>
                    {vehiculos.map(vehiculo => (
                      <option key={vehiculo.id} value={vehiculo.id}>
                        {vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    Servicio
                  </label>
                  <select
                    value={formData.servicio_id}
                    onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      color: "#1e293b"
                    }}
                    required
                  >
                    <option value="">Seleccionar servicio</option>
                    {servicios.map(servicio => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre}
                        {servicio.precio_base != null
                          ? ` - $${parseInt(servicio.precio_base).toLocaleString()}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Fecha y Hora"
                  type="datetime-local"
                  value={formData.fecha_hora}
                  onChange={(e) => setFormData({ ...formData, fecha_hora: e.target.value })}
                  required
                />

                <div>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      color: "#1e293b"
                    }}
                    required
                  >
                    {estados.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      backgroundColor: "white",
                      color: "#1e293b",
                      minHeight: "100px",
                      resize: "vertical"
                    }}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Button type="submit">
                  {editingCita ? (
                    <>
                      <FiSave size={16} />
                      <span>Actualizar</span>
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      <span>Crear</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCita(null);
                    setFormData({ cliente_id: "", vehiculo_id: "", servicio_id: "", fecha_hora: "", estado: "programada", observaciones: "" });
                  }}
                >
                  <FiX size={16} />
                  <span>Cancelar</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="Lista de Citas">
          <Table
            data={citas}
            columns={columns}
            loading={loading}
            emptyMessage="No hay citas programadas"
          />
        </Card>
      </div>
    </div>
  );
}

export default GestionCitas;