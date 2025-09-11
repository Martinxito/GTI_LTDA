import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function EditarPerfil() {
  const { user } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Perfil actualizado (simulado)");
    // Aquí iría la lógica real para actualizar el perfil
  };

  return (
    <div style={{ marginTop: 24 }}>
      <h3>Editar Perfil</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: "10px 18px", background: "#1976d2", color: "#fff", border: "none", fontWeight: "bold" }}
        >
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}

export default EditarPerfil;