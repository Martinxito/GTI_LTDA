import { useState, useEffect } from "react";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import Table from "../components/ui/Table";
import { usuariosService } from "../Servicios/api";

const ROLES_DISPONIBLES = [
  { value: "cliente", label: "Cliente" },
  { value: "mecanico", label: "Mecánico" },
  { value: "jefe_taller", label: "Jefe de Taller" }
];

const FORM_DATA_INICIAL = {
  nombre: "",
  apellido: "",
  email: "",
  telefono: "",
  direccion: "",
  usuario: "",
  rol: ROLES_DISPONIBLES[0].value
};

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);

  const [formData, setFormData] = useState({ ...FORM_DATA_INICIAL });
  const [manualPassword, setManualPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: "", confirmPassword: "" });
  const [newUserCredentials, setNewUserCredentials] = useState(null);

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
      setNewUserCredentials(null);

      if (editingUsuario) {
        const payload = {
          ...formData,
          rol: formData.rol || ROLES_DISPONIBLES[0].value,
          usuario: formData.usuario?.trim() || undefined
        };

        await usuariosService.update(editingUsuario.id, payload);
        setSuccess("Usuario actualizado correctamente");
      } else {
        if (manualPassword) {
          if (!passwordData.password) {
            setError("Debes ingresar una contraseña para el nuevo usuario");
            return;
          }
          if (passwordData.password !== passwordData.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
          }
        }

        const payload = {
          ...formData,
          rol: formData.rol || ROLES_DISPONIBLES[0].value,
          usuario: formData.usuario?.trim() || undefined,
        };

        if (manualPassword) {
          payload.password = passwordData.password;
        }

        const response = await usuariosService.create(payload);

        const plainPassword = manualPassword
          ? passwordData.password
          : response.passwordTemporal;

        setSuccess(
          manualPassword
            ? "Usuario creado correctamente con la contraseña asignada"
            : "Usuario creado correctamente. Se generó una contraseña temporal"
        );

        if (plainPassword) {
          setNewUserCredentials({
            usuario: response.usuario || payload.usuario || payload.email?.toLowerCase(),
            password: plainPassword,
            rol: response.rol || payload.rol,
            esTemporal: !manualPassword
          });
        }
      }

      setShowForm(false);
      setEditingUsuario(null);
      setFormData({ ...FORM_DATA_INICIAL });
      setPasswordData({ password: "", confirmPassword: "" });
      setManualPassword(false);
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
      direccion: usuario.direccion || "",
      usuario: usuario.usuario || "",
      rol: usuario.rol || ROLES_DISPONIBLES[0].value
    });
    setManualPassword(false);
    setPasswordData({ password: "", confirmPassword: "" });
    setNewUserCredentials(null);
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
    { key: "usuario", label: "Usuario" },
    { key: "rol", label: "Rol" },
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
              setFormData({ ...FORM_DATA_INICIAL });
              setManualPassword(false);
              setPasswordData({ password: "", confirmPassword: "" });
              setNewUserCredentials(null);
            }}
          >
            ➕ Nuevo Usuario
          </Button>
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}
        {newUserCredentials && (
          <Alert
            type="info"
            title="Comparte estas credenciales con el usuario"
            onClose={() => setNewUserCredentials(null)}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <span>
                Usuario: <strong>{newUserCredentials.usuario}</strong>
              </span>
              <span>
                Contraseña: <strong>{newUserCredentials.password}</strong>
                {newUserCredentials.esTemporal && " (temporal)"}
              </span>
              {newUserCredentials.esTemporal && (
                <span>
                  Pídele que la cambie en su primer ingreso.
                </span>
              )}
            </div>
          </Alert>
        )}

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
                <Input
                  label="Usuario"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  placeholder="Si lo dejas vacío se usará el email"
                />
                <div>
                  <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem", color: "#1e293b" }}>
                    Rol
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      fontSize: "var(--font-size-base)",
                      fontFamily: "var(--font-family)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--border-radius)",
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--text-primary)"
                    }}
                    required
                  >
                    {ROLES_DISPONIBLES.map((rol) => (
                      <option key={rol.value} value={rol.value}>
                        {rol.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingUsuario && (
                <div style={{ marginTop: "1rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1e293b", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={manualPassword}
                      onChange={(e) => {
                        setManualPassword(e.target.checked);
                        setPasswordData({ password: "", confirmPassword: "" });
                      }}
                    />
                    Asignar una contraseña manualmente
                  </label>
                  {!manualPassword && (
                    <p style={{ fontSize: "var(--font-size-sm)", color: "#475569", marginTop: "0.5rem" }}>
                      Si no marcas esta opción se generará automáticamente una contraseña temporal.
                    </p>
                  )}
                </div>
              )}

              {!editingUsuario && manualPassword && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                  <Input
                    label="Contraseña"
                    type="password"
                    value={passwordData.password}
                    onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                    required
                  />
                  <Input
                    label="Confirmar contraseña"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                  />
                </div>
              )}

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
                    setFormData({ ...FORM_DATA_INICIAL });
                    setPasswordData({ password: "", confirmPassword: "" });
                    setManualPassword(false);
                    setNewUserCredentials(null);
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
