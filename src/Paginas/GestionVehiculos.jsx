import { useState, useEffect, useContext, useCallback } from "react";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { vehiculosService, usuariosService } from "../Servicios/api";
import { AuthContext } from "../context/AuthContext"; // Importar el contexto de autenticación

function GestionVehiculos() {
  const { user } = useContext(AuthContext); // Obtener el usuario y su rol
  const [vehiculos, setVehiculos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState(null);

  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    año: "",
    placa: "",
    color: "",
    cliente_id: ""
  });

  const loadVehiculos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await vehiculosService.getAll();

      // Filtrar vehículos según el rol del usuario
      const filteredVehiculos =
        user.rol === "Cliente"
          ? data.filter((vehiculo) => vehiculo.cliente_id === user.id) // Mostrar solo vehículos del cliente
          : data; // Mostrar todos los vehículos para otros roles

      setVehiculos(Array.isArray(filteredVehiculos) ? filteredVehiculos : []);
    } catch (error) {
      setError("Error al cargar vehículos: " + error.message);
      setVehiculos([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadUsuarios = useCallback(async () => {
    try {
      const data = await usuariosService.getAll();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  }, []);

  useEffect(() => {
    loadVehiculos();
    loadUsuarios();
  }, [loadVehiculos, loadUsuarios]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingVehiculo) {
        await vehiculosService.update(editingVehiculo.id, formData);
        setSuccess("Vehículo actualizado correctamente");
      } else {
        await vehiculosService.create(formData);
        setSuccess("Vehículo creado correctamente");
      }

      setShowForm(false);
      setEditingVehiculo(null);
      setFormData({ marca: "", modelo: "", año: "", placa: "", color: "", cliente_id: "" });
      loadVehiculos();
    } catch (error) {
      setError("Error al guardar vehículo: " + error.message);
    }
  };

  const handleEdit = (vehiculo) => {
    setEditingVehiculo(vehiculo);
    setFormData({
      marca: vehiculo.marca || "",
      modelo: vehiculo.modelo || "",
      año: vehiculo.año || "",
      placa: vehiculo.placa || "",
      color: vehiculo.color || "",
      cliente_id: vehiculo.cliente_id || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este vehículo?")) {
      try {
        await vehiculosService.delete(id);
        setSuccess("Vehículo eliminado correctamente");
        loadVehiculos();
      } catch (error) {
        setError("Error al eliminar vehículo: " + error.message);
      }
    }
  };

  const getUsuarioNombre = (usuarioId) => {
    const usuario = usuarios.find((c) => c.id === usuarioId);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : "N/A";
  };

  const columns = [
    { key: "marca", label: "Marca" },
    { key: "modelo", label: "Modelo" },
    { key: "año", label: "Año" },
    { key: "placa", label: "Placa" },
    { key: "color", label: "Color" },
    {
      key: "usuario_nombre",
      label: "Propietario",
      render: (vehiculo) => getUsuarioNombre(vehiculo.cliente_id)
    },
    {
      key: "actions",
      label: "Acciones",
      render: (vehiculo) =>
        user.rol === "Jefe de Taller" && ( // Solo mostrar acciones para el Jefe de Taller
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(vehiculo)}
            >
              ✏️ Editar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(vehiculo.id)}
            >
              🗑️ Eliminar
            </Button>
          </div>
        )
    }
  ];

  return (
    <div>
      <Menu />

      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem"
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "700",
              color: "#1e293b",
              margin: 0
            }}
          >
            🚗 Gestión de Vehículos
          </h1>
          {user.rol === "Jefe de Taller" && (
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingVehiculo(null);
                setFormData({
                  marca: "",
                  modelo: "",
                  año: "",
                  placa: "",
                  color: "",
                  cliente_id: ""
                });
              }}
            >
              ➕ Nuevo Vehículo
            </Button>
          )}
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

        {showForm && (
          <Card
            title={editingVehiculo ? "Editar Vehículo" : "Nuevo Vehículo"}
            className="mb-6"
          >
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1rem"
                }}
              >
                <Input
                  label="Marca"
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData({ ...formData, marca: e.target.value })
                  }
                  required
                />
                <Input
                  label="Modelo"
                  value={formData.modelo}
                  onChange={(e) =>
                    setFormData({ ...formData, modelo: e.target.value })
                  }
                  required
                />
                <Input
                  label="Año"
                  type="number"
                  value={formData.año}
                  onChange={(e) =>
                    setFormData({ ...formData, año: e.target.value })
                  }
                  required
                />
                <Input
                  label="Placa"
                  value={formData.placa}
                  onChange={(e) =>
                    setFormData({ ...formData, placa: e.target.value })
                  }
                  required
                />
                <Input
                  label="Color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                />
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      color: "#1e293b",
                      marginBottom: "0.5rem"
                    }}
                  >
                    Propietario
                  </label>
                  <select
                    value={formData.cliente_id}
                    onChange={(e) =>
                      setFormData({ ...formData, cliente_id: e.target.value })
                    }
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
                    {usuarios.map((usuario) => (
                      <option key={usuario.id} value={usuario.id}>
                        {usuario.nombre} {usuario.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Button type="submit">
                  {editingVehiculo ? "💾 Actualizar" : "➕ Crear"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingVehiculo(null);
                    setFormData({
                      marca: "",
                      modelo: "",
                      año: "",
                      placa: "",
                      color: "",
                      cliente_id: ""
                    });
                  }}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="Lista de Vehículos">
          <Table
            data={vehiculos}
            columns={columns}
            loading={loading}
            emptyMessage="No hay vehículos registrados"
          />
        </Card>
      </div>
    </div>
  );
}

export default GestionVehiculos;