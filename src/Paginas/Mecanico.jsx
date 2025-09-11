import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Mecanico() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([
    // Estos datos luego vendrán del backend
    {
      id: 1,
      fecha: "2025-09-15",
      hora: "10:00",
      servicio: "Cambio de aceite",
      cliente: "Martín",
      vehiculo: "Toyota Corolla",
      estado: "Pendiente",
    },
    {
      id: 2,
      fecha: "2025-09-16",
      hora: "14:00",
      servicio: "Revisión de frenos",
      cliente: "Ana",
      vehiculo: "Ford Fiesta",
      estado: "En proceso",
    },
  ]);

  // Simulación de marcar cita como completada
  const completarCita = (id) => {
    setCitas(
      citas.map((cita) =>
        cita.id === id ? { ...cita, estado: "Completada" } : cita
      )
    );
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto" }}>
      <h2>Bienvenido, {user?.nombre || "Mecánico"}</h2>
      <h3>Mis Servicios Asignados</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Servicio</th>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((cita) => (
            <tr key={cita.id}>
              <td>{cita.fecha}</td>
              <td>{cita.hora}</td>
              <td>{cita.servicio}</td>
              <td>{cita.cliente}</td>
              <td>{cita.vehiculo}</td>
              <td>{cita.estado}</td>
              <td>
                {cita.estado !== "Completada" && (
                  <button onClick={() => completarCita(cita.id)}>
                    Marcar como completada
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Mecanico;