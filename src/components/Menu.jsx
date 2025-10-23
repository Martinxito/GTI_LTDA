import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";
import {
  FiActivity,
  FiBarChart2,
  FiBox,
  FiCalendar,
  FiClipboard,
  FiLogOut,
  FiTool,
  FiTruck,
  FiUser,
  FiUsers
} from "react-icons/fi";

const navStyle = {
  background: "var(--bg-primary)",
  borderBottom: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-sm)",
  position: "sticky",
  top: 0,
  zIndex: 100,
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "var(--spacing-md) var(--spacing-lg)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--spacing-lg)",
};

const brandStyle = {
  fontSize: "var(--font-size-xl)",
  fontWeight: "700",
  color: "var(--primary-color)",
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-sm)",
};

const linksWrapperStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--spacing-xs)",
};

const leftSectionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-lg)",
  flex: 1,
};

const rightSectionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-md)",
};

const userInfoStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "0.25rem",
};

const userNameStyle = {
  fontSize: "var(--font-size-sm)",
  fontWeight: "600",
  color: "var(--text-primary)",
};

const roleBadgeStyle = {
  backgroundColor: "var(--bg-tertiary)",
  color: "var(--text-secondary)",
  padding: "0.125rem 0.5rem",
  borderRadius: "999px",
  fontSize: "var(--font-size-xs)",
  fontWeight: "500",
};

const dashboardPaths = {
  jefe_taller: "/dashboard",
  mecanico: "/dashboard-mecanico",
  cliente: "/dashboard-cliente",
};

const navItemsByRole = {
  jefe_taller: [
    { to: "/usuarios", label: "Usuarios", icon: FiUsers },
    { to: "/vehiculos", label: "Vehículos", icon: FiTruck },
    { to: "/servicios", label: "Servicios", icon: FiTool },
    { to: "/citas", label: "Citas", icon: FiCalendar },
    { to: "/calendario", label: "Calendario", icon: FiCalendar },
    { to: "/historial", label: "Historial", icon: FiClipboard },
    { to: "/jefe-taller", label: "Inventario", icon: FiBox },
    { to: "/diagnostico", label: "Diagnóstico", icon: FiActivity },
  ],
  mecanico: [
    { to: "/citas", label: "Mis Citas", icon: FiCalendar },
    { to: "/calendario", label: "Calendario", icon: FiCalendar },
    { to: "/servicios", label: "Servicios", icon: FiTool },
    { to: "/mecanico", label: "Inventario", icon: FiBox },
  ],
  cliente: [
    { to: "/citas", label: "Mis Citas", icon: FiCalendar },
    { to: "/calendario", label: "Calendario", icon: FiCalendar },
    { to: "/vehiculos", label: "Mis Vehículos", icon: FiTruck },
    { to: "/historial", label: "Historial", icon: FiClipboard },
    { to: "/cliente", label: "Mi Perfil", icon: FiUser },
  ],
};

const roleLabels = {
  jefe_taller: "Jefe de Taller",
  mecanico: "Mecánico",
  cliente: "Cliente",
};

const navLinkClassName = ({ isActive }) =>
  `nav-link${isActive ? " nav-link--active" : ""}`;

function Menu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dashboardPath = dashboardPaths[user?.rol] || "/dashboard";
  const navItems = navItemsByRole[user?.rol] || [];

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <div style={leftSectionStyle}>
          <div style={brandStyle}>
            <FiTool size={22} />
            <span>GTI LTDA</span>
          </div>

          <div style={linksWrapperStyle}>
            <NavLink to={dashboardPath} className={navLinkClassName}>
              <span className="nav-link__icon">
                <FiBarChart2 size={16} />
              </span>
              <span>Dashboard</span>
            </NavLink>
            {navItems.map(({ to, label, icon }) => {
              const IconComponent = icon;
              return (
                <NavLink key={to} to={to} className={navLinkClassName}>
                  <span className="nav-link__icon">
                    <IconComponent size={16} />
                  </span>
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {user && (
          <div style={rightSectionStyle}>
            <div style={userInfoStyle}>
              <span style={userNameStyle}>{user.nombre}</span>
              <span style={roleBadgeStyle}>{roleLabels[user.rol] || "Usuario"}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <FiLogOut size={16} />
              <span>Salir</span>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Menu;
