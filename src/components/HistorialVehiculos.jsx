function HistorialVehiculos() {
  // Datos de ejemplo
  const historial = [
    {
      id: 1,
      vehiculo: "Toyota Corolla",
      servicio: "Cambio de aceite",
      fecha: "2025-05-10",
      taller: "GTI LTDA",
    },
    {
      id: 2,
      vehiculo: "Ford Fiesta",
      servicio: "Revisión de frenos",
      fecha: "2025-06-22",
      taller: "GTI LTDA",
    },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Historial de Vehículos</h3>
      {historial.length === 0 ? (
        <p>No hay servicios registrados.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Vehículo</th>
              <th>Servicio</th>
              <th>Fecha</th>
              <th>Taller</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((item) => (
              <tr key={item.id}>
                <td>{item.vehiculo}</td>
                <td>{item.servicio}</td>
                <td>{item.fecha}</td>
                <td>{item.taller}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default HistorialVehiculos;