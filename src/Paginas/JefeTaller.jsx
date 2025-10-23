import { useState, useEffect } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiBox,
  FiCheckCircle,
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
import { inventarioService } from "../Servicios/api";

function JefeTaller() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    cantidad_minima: "",
    precio_compra: "",
    precio_venta: "",
    categoria: ""
  });

  useEffect(() => {
    loadInventario();
  }, []);

  const loadInventario = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getAll();
      setInventario(Array.isArray(data) ? data : []);
    } catch (error) {
      setError("Error al cargar inventario: " + error.message);
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingItem) {
        await inventarioService.update(editingItem.id, formData);
        setSuccess("Item actualizado correctamente");
      } else {
        await inventarioService.create(formData);
        setSuccess("Item creado correctamente");
      }
      
      setShowForm(false);
      setEditingItem(null);
      setFormData({ nombre: "", descripcion: "", cantidad: "", cantidad_minima: "", precio_compra: "", precio_venta: "", categoria: "" });
      loadInventario();
    } catch (error) {
      setError("Error al guardar item: " + error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre || "",
      descripcion: item.descripcion || "",
      cantidad: item.cantidad || "",
      cantidad_minima: item.cantidad_minima || "",
      precio_compra: item.precio_compra || "",
      precio_venta: item.precio_venta || "",
      categoria: item.categoria || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este item?")) {
      try {
        await inventarioService.delete(id);
        setSuccess("Item eliminado correctamente");
        loadInventario();
      } catch (error) {
        setError("Error al eliminar item: " + error.message);
      }
    }
  };

  const categorias = [
    "Repuestos",
    "Herramientas",
    "Lubricantes",
    "Filtros",
    "Frenos",
    "Suspensión",
    "Motor",
    "Eléctrico",
    "Otros"
  ];

  const getStockStatus = (cantidad, cantidadMinima) => {
    const cantidadNum = parseInt(cantidad);
    const minimaNum = parseInt(cantidadMinima);

    if (cantidadNum <= minimaNum) {
      return { color: "#ef4444", text: "Stock bajo", icon: FiAlertTriangle };
    } else if (cantidadNum <= minimaNum * 2) {
      return { color: "#f59e0b", text: "Stock medio", icon: FiActivity };
    } else {
      return { color: "#10b981", text: "Stock óptimo", icon: FiCheckCircle };
    }
  };

  const columns = [
    { key: "nombre", label: "Nombre" },
    { key: "categoria", label: "Categoría" },
    {
      key: "cantidad",
      label: "Cantidad",
      render: (item) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>{item.cantidad}</span>
          {(() => {
            const status = getStockStatus(item.cantidad, item.cantidad_minima);
            return (
              <span
                style={{
                  color: status.color,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <status.icon size={14} />
                <span>{status.text}</span>
              </span>
            );
          })()}
        </div>
      )
    },
    { key: "cantidad_minima", label: "Mínimo" },
    { 
      key: "precio_compra", 
      label: "Precio Compra",
      render: (item) => `$${parseInt(item.precio_compra || 0).toLocaleString()}`
    },
    { 
      key: "precio_venta", 
      label: "Precio Venta",
      render: (item) => `$${parseInt(item.precio_venta || 0).toLocaleString()}`
    },
    {
      key: "actions",
      label: "Acciones",
          render: (item) => (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(item)}
              >
                <FiEdit size={16} />
                <span>Editar</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(item.id)}
              >
                <FiTrash2 size={16} />
                <span>Eliminar</span>
              </Button>
            </div>
          )
        }
      ];

  const stockBajo = inventario.filter(item => 
    parseInt(item.cantidad) <= parseInt(item.cantidad_minima)
  );

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
            <FiBox size={26} color="#2563eb" />
            <span>Gestión de inventario</span>
          </h1>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingItem(null);
              setFormData({ nombre: "", descripcion: "", cantidad: "", cantidad_minima: "", precio_compra: "", precio_venta: "", categoria: "" });
            }}
          >
            <FiPlus size={16} />
            <span>Nuevo item</span>
          </Button>
        </div>

        {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
        {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

        {/* Alertas de stock bajo */}
        {stockBajo.length > 0 && (
          <Alert type="warning">
            <strong>Stock bajo:</strong> {stockBajo.length} item(s) necesitan reposición:
            {stockBajo.map(item => ` ${item.nombre}`).join(", ")}
          </Alert>
        )}

        {showForm && (
          <Card title={editingItem ? "Editar Item" : "Nuevo Item"} className="mb-6">
            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                <Input
                  label="Nombre del Item"
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
                  label="Cantidad Actual"
                  type="number"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  required
                />
                <Input
                  label="Cantidad Mínima"
                  type="number"
                  value={formData.cantidad_minima}
                  onChange={(e) => setFormData({ ...formData, cantidad_minima: e.target.value })}
                  required
                />
                <Input
                  label="Precio de Compra"
                  type="number"
                  value={formData.precio_compra}
                  onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                  required
                />
                <Input
                  label="Precio de Venta"
                  type="number"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
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
                    placeholder="Descripción del item..."
                  />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                <Button type="submit">
                  {editingItem ? (
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
                    setEditingItem(null);
                    setFormData({ nombre: "", descripcion: "", cantidad: "", cantidad_minima: "", precio_compra: "", precio_venta: "", categoria: "" });
                  }}
                >
                  <FiX size={16} />
                  <span>Cancelar</span>
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card title="Inventario">
          <Table
            data={inventario}
            columns={columns}
            loading={loading}
            emptyMessage="No hay items en el inventario"
          />
        </Card>
      </div>
    </div>
  );
}

export default JefeTaller;