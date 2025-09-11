import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(usuario, password);
    if (result.success) {
      if (result.rol === "jefe-taller") navigate("/jefe-taller");
      else if (result.rol === "cliente") navigate("/cliente");
      else if (result.rol === "mecanico") navigate("/mecanico");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: "40px auto" }}>
      <h2>Iniciar sesión</h2>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={e => setUsuario(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8 }}
        />
      </div>
      <button type="submit" style={{ width: "100%", padding: 10, background: "#1976d2", color: "#fff", border: "none", fontWeight: "bold" }}>
        Entrar
      </button>
    </form>
  );
}

export default Login;