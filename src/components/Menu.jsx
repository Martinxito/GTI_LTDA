import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

const linkStyle = {
  textDecoration: "none",
  color: "var(--text-secondary)",
  fontWeight: "600",
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--spacing-sm)",
  padding: "var(--spacing-sm) var(--spacing-md)",
  borderRadius: "var(--border-radius)",
  transition: "var(--transition-fast)",
  fontSize: "var(--font-size-sm)",
};

const activeStyle = {
  color: "var(--primary-color)",
  backgroundColor: "var(--primary-light)",
};

function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Debug: Log del usuario y rol
  console.log('Menu - Usuario:', user);
  console.log('Menu - Rol:', user?.rol);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'jefe_taller':
        return '👔';
      case 'mecanico':
        return '🔧';
      case 'cliente':
        return '👤';
      default:
        return '👤';
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'jefe_taller':
        return 'Jefe de Taller';
      case 'mecanico':
        return 'Mecánico';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  };

  return (
    <nav style={{
      background: "var(--bg-primary)",
      borderBottom: "1px solid var(--border-color)",
      boxShadow: "var(--shadow-sm)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "var(--spacing-md) var(--spacing-lg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        {/* Logo y navegación */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-lg)" }}>
          <div style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "700",
            color: "var(--primary-color)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-sm)"
          }}>
            🔧 GTI LTDA
          </div>
          
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <NavLink
              to={user?.rol === 'jefe_taller' ? "/dashboard" : 
                  user?.rol === 'mecanico' ? "/dashboard-mecanico" : 
                  user?.rol === 'cliente' ? "/dashboard-cliente" : "/dashboard"}
              style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
            >
              📊 Dashboard
            </NavLink>
            {user && (
              <>
                {user.rol === 'jefe_taller' && (
                  <>
                    <NavLink
                      to="/clientes"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      👥 Clientes
                    </NavLink>
                    <NavLink
                      to="/vehiculos"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      🚗 Vehículos
                    </NavLink>
                    <NavLink
                      to="/servicios"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      🔧 Servicios
                    </NavLink>
                    <NavLink
                      to="/citas"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📅 Citas
                    </NavLink>
                    <NavLink
                      to="/calendario"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📆 Calendario
                    </NavLink>
                    <NavLink
                      to="/historial"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📋 Historial
                    </NavLink>
                    <NavLink
                      to="/jefe-taller"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📦 Inventario
                    </NavLink>
                    <NavLink
                      to="/diagnostico"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      🔧 Diagnóstico
                    </NavLink>
                  </>
                )}
                {user.rol === 'mecanico' && (
                  <>
                    <NavLink
                      to="/citas"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📅 Mis Citas
                    </NavLink>
                    <NavLink
                      to="/calendario"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📆 Calendario
                    </NavLink>
                    <NavLink
                      to="/servicios"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      🔧 Servicios
                    </NavLink>
                    <NavLink
                      to="/mecanico"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📦 Inventario
                    </NavLink>
                  </>
                )}
                {user.rol === 'cliente' && (
                  <>
                    <NavLink
                      to="/citas"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📅 Mis Citas
                    </NavLink>
                    <NavLink
                      to="/calendario"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📆 Calendario
                    </NavLink>
                    <NavLink
                      to="/vehiculos"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      🚗 Mis Vehículos
                    </NavLink>
                    <NavLink
                      to="/historial"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      📋 Historial
                    </NavLink>
                    <NavLink
                      to="/cliente"
                      style={({ isActive }) => (isActive ? { ...linkStyle, ...activeStyle } : linkStyle)}
                    >
                      👤 Mi Perfil
                    </NavLink>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Información del usuario */}
        {user && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "var(--spacing-md)",
            padding: "var(--spacing-sm) var(--spacing-md)",
            backgroundColor: "var(--bg-secondary)",
            borderRadius: "var(--border-radius)",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ 
                fontSize: "var(--font-size-sm)", 
                fontWeight: "600", 
                color: "var(--text-primary)" 
              }}>
                {user.nombre}
              </div>
              <div style={{ 
                fontSize: "var(--font-size-xs)", 
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-xs)"
              }}>
                {getRoleIcon(user.rol)} {getRoleName(user.rol)}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              🚪 Salir
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Menu;