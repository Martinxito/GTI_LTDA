import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import AgendaCliente from "../components/AgendaCliente";
import HistorialVehiculos from "../components/HistorialVehiculos";
import EditarPerfil from "../components/EditarPerfil";

function Cliente() {
  const { user } = useAuth();
  const [seccion, setSeccion] = useState(null);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>Bienvenido, {user?.nombre || "Cliente"}</h2>
      <p>Esta es tu área de cliente. Aquí puedes:</p>
      <ul>
        <li>📅 <b>Ver y gestionar tu agenda de servicios</b></li>
        <li>📝 <b>Consultar el historial de tus vehículos</b></li>
        <li>👤 <b>Editar tu perfil</b></li>
      </ul>
      <div style={{ marginTop: 32 }}>
        <button
          style={{ marginRight: 12, padding: "10px 18px" }}
          onClick={() => setSeccion("agenda")}
        >
          Ver Agenda
        </button>
        <button
          style={{ marginRight: 12, padding: "10px 18px" }}
          onClick={() => setSeccion("historial")}
        >
          Historial de Vehículos
        </button>
        <button
          style={{ padding: "10px 18px" }}
          onClick={() => setSeccion("perfil")}
        >
          Editar Perfil
        </button>
      </div>

      {/* Sección dinámica */}
      {seccion === "agenda" && <AgendaCliente />}
      {seccion === "historial" && <HistorialVehiculos />}
      {seccion === "perfil" && <EditarPerfil />}
    </div>
  );
}

export default Cliente;