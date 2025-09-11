import { NavLink, useNavigate } from "react-router-dom";
import { FaSignInAlt, FaUser, FaTools, FaUserTie, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const linkStyle = {
  marginRight: "18px",
  textDecoration: "none",
  color: "#333",
  fontWeight: "bold",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
};

const activeStyle = {
  color: "#1976d2",
  textDecoration: "underline",
};

function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={{
      marginBottom: "24px",
      background: "#f5f5f5",
      padding: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }}>
      <div>
        <NavLink
          to="/"
          style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
          end
        >
          <FaSignInAlt /> Login
        </NavLink>
        <NavLink
          to="/cliente"
          style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
        >
          <FaUser /> Cliente
        </NavLink>
        <NavLink
          to="/mecanico"
          style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
        >
          <FaTools /> Mecánico
        </NavLink>
        <NavLink
          to="/jefe-taller"
          style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
        >
          <FaUserTie /> Jefe de Taller
        </NavLink>
      </div>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontWeight: "bold", color: "#1976d2" }}>
            {user.nombre}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#d32f2f",
              cursor: "pointer",
              fontSize: "1.1em",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <FaSignOutAlt /> Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  );
}

export default Menu;