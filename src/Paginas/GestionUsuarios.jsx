import { useState, useEffect } from "react";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { usuariosService } from "../Servicios/api";

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: ""
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error al cargar usuarios: " + error.message);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingUsuario) {
        await usuariosService.update(editingUsuario.id, formData);
        setSuccess("Usuario actualizado correctamente");
      } else {
        await usuariosService.create(formData);
        setSuccess("Usuario creado correctamente");
      }
      
      setShowForm(false);
      setEditingUsuario(null);
      setFormData({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
      loadUsuarios();
    } catch (error) {
      setError("Error al guardar usuario: " + error.message);
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre || "",
      apellido: usuario.apellido || "",
      email: usuario.email || "",
      telefono: usuario.telefono || "",
      direccion: usuario.direccion || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await usuariosService.delete(id);
        setSuccess("Usuario eliminado correctamente");
        loadUsuarios();
      } catch (error) {
        setError("Error al eliminar usuario: " + error.message);
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
      render: (usuario) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(usuario)}
          >
            ✏️ Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(usuario.id)}
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
            👥 Gestión de Usuarios
          </h1>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingUsuario(null);
              setFormData({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
            }}
          >
            ➕ Nuevo Usuario
          </Button>
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

        {showForm && (
          <Card title={editingUsuario ? "Editar Usuario" : "Nuevo Usuario"} className="mb-6">
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
                  {editingUsuario ? "💾 Actualizar" : "➕ Crear"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUsuario(null);
                    setFormData({ nombre: "", apellido: "", email: "", telefono: "", direccion: "" });
                  }}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="Lista de Usuarios">
          <Table
            data={usuarios}
            columns={columns}
            loading={loading}
            emptyMessage="No hay Usuarios registrados"
          />
        </Card>
      </div>
    </div>
  );
}

export default GestionUsuarios;