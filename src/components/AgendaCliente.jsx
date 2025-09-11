import { useState } from "react";

// Datos de ejemplo de citas
const citasEjemplo = [
  {
    id: 1,
    fecha: "2025-09-15",
    hora: "10:00",
    servicio: "Cambio de aceite",
    vehiculo: "Toyota Corolla",
    estado: "Confirmada",
  },
  {
    id: 2,
    fecha: "2025-09-20",
    hora: "15:00",
    servicio: "Revisión de frenos",
    vehiculo: "Ford Fiesta",
    estado: "Pendiente",
  },
];

function AgendaCliente() {
  const [citas] = useState(citasEjemplo);

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Agenda de Servicios</h3>
      {citas.length === 0 ? (
        <p>No tienes citas agendadas.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Servicio</th>
              <th>Vehículo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.fecha}</td>
                <td>{cita.hora}</td>
                <td>{cita.servicio}</td>
                <td>{cita.vehiculo}</td>
                <td>{cita.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AgendaCliente;