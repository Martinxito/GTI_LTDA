import { useState, useEffect } from "react";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { clientesService } from "../Servicios/api";

function GestionClientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: ""
  });

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const data = await clientesService.getAll();
      setClientes(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error al cargar clientes: " + error.message);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingCliente) {
        await clientesService.update(editingCliente.id, formData);
        setSuccess("Cliente actualizado correctamente");
      } else {
        await clientesService.create(formData);
        setSuccess("Cliente creado correctamente");
      }
      
      setShowForm(false);
      setEditingCliente(null);
      setFormData({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
      loadClientes();
    } catch (error) {
      setError("Error al guardar cliente: " + error.message);
    }
  };

  const handleEdit = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      try {
        await clientesService.delete(id);
        setSuccess("Cliente eliminado correctamente");
        loadClientes();
      } catch (error) {
        setError("Error al eliminar cliente: " + error.message);
      }
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "email", label: "Email" },
    { key: "telefono", label: "Teléfono" },
    { key: "direccion", label: "Dirección" },
    {
      key: "actions",
      label: "Acciones",
      render: (cliente) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(cliente)}
          >
            ✏️ Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(cliente.id)}
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
            👥 Gestión de Clientes
          </h1>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingCliente(null);
              setFormData({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
            }}
          >
            ➕ Nuevo Cliente
          </Button>
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

        {showForm && (
          <Card title={editingCliente ? "Editar Cliente" : "Nuevo Cliente"} className="mb-6">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <Input
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
                <Input
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
                <Input
                  label="Dirección"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Button type="submit">
                  {editingCliente ? "💾 Actualizar" : "➕ Crear"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCliente(null);
                    setFormData({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
                  }}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="Lista de Clientes">
          <Table
            data={clientes}
            columns={columns}
            loading={loading}
            emptyMessage="No hay clientes registrados"
          />
        </Card>
      </div>
    </div>
  );
}

export default GestionClientes;