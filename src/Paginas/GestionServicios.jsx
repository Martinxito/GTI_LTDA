import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { serviciosService } from "../Servicios/api";

function GestionServicios() {
  const { user } = useAuth();
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingServicio, setEditingServicio] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    categoria: "",
    duracion_estimada: ""
  });

  useEffect(() => {
    loadServicios();
  }, []);

  const loadServicios = async () => {
    try {
      setLoading(true);
      const data = await serviciosService.getAll();
      setServicios(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error al cargar servicios: " + error.message);
      setServicios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingServicio) {
        await serviciosService.update(editingServicio.id, formData);
        setSuccess("Servicio actualizado correctamente");
      } else {
        await serviciosService.create(formData);
        setSuccess("Servicio creado correctamente");
      }
      
      setShowForm(false);
      setEditingServicio(null);
      setFormData({ nombre: "", descripcion: "", precio: "", categoria: "", duracion_estimada: "" });
      loadServicios();
    } catch (error) {
      setError("Error al guardar servicio: " + error.message);
    }
  };

  const handleEdit = (servicio) => {
    setEditingServicio(servicio);
    setFormData({
      nombre: servicio.nombre || "",
      descripcion: servicio.descripcion || "",
      precio: servicio.precio || "",
      categoria: servicio.categoria || "",
      duracion_estimada: servicio.duracion_estimada || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      try {
        await serviciosService.delete(id);
        setSuccess("Servicio eliminado correctamente");
        loadServicios();
      } catch (error) {
        setError("Error al eliminar servicio: " + error.message);
      }
    }
  };

  const categorias = [
    "Mantenimiento Preventivo",
    "Reparación",
    "Diagnóstico",
    "Limpieza",
    "Revisión Técnica",
    "Otros"
  ];

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "descripcion", label: "Descripción" },
    { key: "categoria", label: "Categoría" },
    { 
      key: "precio", 
      label: "Precio",
      render: (servicio) => servicio.precio ? `$${parseInt(servicio.precio).toLocaleString()}` : 'N/A'
    },
    { key: "duracion_estimada", label: "Duración (min)" },
    {
      key: "actions",
      label: "Acciones",
      render: (servicio) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(servicio)}
          >
            ✏️ Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(servicio.id)}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
            🔧 Gestión de Servicios
          </h1>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingServicio(null);
              setFormData({ nombre: "", descripcion: "", precio: "", categoria: "", duracion_estimada: "" });
            }}
          >
            ➕ Nuevo Servicio
          </Button>
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

        {showForm && (
          <Card title={editingServicio ? "Editar Servicio" : "Nuevo Servicio"} className="mb-6">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <Input
                  label="Nombre del Servicio"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                    Categoría
                  </label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
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
                    <option value="">Seleccionar categoría</option>
                    {categorias.map(categoria => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Precio"
                  type="number"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  required
                />
                <Input
                  label="Duración Estimada (minutos)"
                  type="number"
                  value={formData.duracion_estimada}
                  onChange={(e) => setFormData({ ...formData, duracion_estimada: e.target.value })}
                  required
                />
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    color: "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Button type="submit">
                  {editingServicio ? "💾 Actualizar" : "➕ Crear"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingServicio(null);
                    setFormData({ nombre: "", descripcion: "", precio: "", categoria: "", duracion_estimada: "" });
                  }}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="Lista de Servicios">
          <Table
            data={servicios}
            columns={columns}
            loading={loading}
            emptyMessage="No hay servicios registrados"
          />
        </Card>
      </div>
    </div>
  );
}

export default GestionServicios;