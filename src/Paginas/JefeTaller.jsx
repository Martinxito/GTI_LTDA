import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function JefeTaller() {
  const { user } = useAuth();
  const [inventario, setInventario] = useState([
    // Estos datos luego vendrán del backend
    { id: 1, nombre: "Filtro de aceite", cantidad: 12 },
    { id: 2, nombre: "Pastillas de freno", cantidad: 8 },
    { id: 3, nombre: "Aceite sintético", cantidad: 20 },
  ]);

  // Simulación de agregar repuesto
  const agregarRepuesto = () => {
    const nombre = prompt("Nombre del repuesto:");
    const cantidad = parseInt(prompt("Cantidad:"), 10);
    if (nombre && cantidad > 0) {
      setInventario([...inventario, { id: Date.now(), nombre, cantidad }]);
    }
  };

  // Simulación de eliminar repuesto
  const eliminarRepuesto = (id) => {
    setInventario(inventario.filter((item) => item.id !== id));
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>Bienvenido, {user?.nombre || "Jefe de Taller"}</h2>
      <h3>Inventario de Repuestos</h3>
      <button onClick={agregarRepuesto} style={{ marginBottom: 12 }}>
        Agregar Repuesto
      </button>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cantidad</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={item.id}>
              <td>{item.nombre}</td>
              <td>{item.cantidad}</td>
              <td>
                <button onClick={() => eliminarRepuesto(item.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JefeTaller;