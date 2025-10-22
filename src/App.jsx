import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import RutaPrivada from "./components/RutaPrivada";
import Login from "./Paginas/Login";
import Dashboard from "./Paginas/Dashboard";
import DashboardMecanico from "./Paginas/DashboardMecanico";
import DashboardCliente from "./Paginas/DashboardCliente";
import GestionUsuarios from "./Paginas/GestionUsuarios";
import GestionVehiculos from "./Paginas/GestionVehiculos";
import GestionServicios from "./Paginas/GestionServicios";
import GestionCitas from "./Paginas/GestionCitas";
import CalendarioCitas from "./Paginas/CalendarioCitas";
import HistorialMantenimiento from "./Paginas/HistorialMantenimiento";
import Cliente from "./Paginas/Cliente";
import Mecanico from "./Paginas/Mecanico";
import JefeTaller from "./Paginas/JefeTaller";
import Diagnostico from "./Paginas/Diagnostico";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            
            {/* Dashboard - Solo Jefe de Taller */}
            <Route
              path="/dashboard"
              element={
                <RutaPrivada rol="jefe_taller">
                  <Dashboard />
                </RutaPrivada>
              }
            />
            
            {/* Dashboard específico para Mecánico */}
            <Route
              path="/dashboard-mecanico"
              element={
                <RutaPrivada rol="mecanico">
                  <DashboardMecanico />
                </RutaPrivada>
              }
            />
            
            {/* Dashboard específico para Cliente */}
            <Route
              path="/dashboard-cliente"
              element={
                <RutaPrivada rol="cliente">
                  <DashboardCliente />
                </RutaPrivada>
              }
            />
            
            {/* Gestión de Usuarios - Solo Jefe de Taller */}
            <Route
              path="/usuarios"
              element={
                <RutaPrivada rol="jefe_taller">
                  <GestionUsuarios />
                </RutaPrivada>
              }
            />
            <Route path="/clientes" element={<Navigate to="/usuarios" replace />} />
            
            {/* Gestión de Vehículos - Jefe de Taller y Cliente */}
            <Route
              path="/vehiculos"
              element={
                <RutaPrivada roles={["jefe_taller", "cliente"]}>
                  <GestionVehiculos />
                </RutaPrivada>
              }
            />
            
            {/* Gestión de Servicios - Jefe de Taller y Mecánico */}
            <Route
              path="/servicios"
              element={
                <RutaPrivada roles={["jefe_taller", "mecanico"]}>
                  <GestionServicios />
                </RutaPrivada>
              }
            />
            
            {/* Gestión de Citas - Todos los roles */}
            <Route
              path="/citas"
              element={
                <RutaPrivada>
                  <GestionCitas />
                </RutaPrivada>
              }
            />
            
            {/* Calendario de Citas - Todos los roles */}
            <Route
              path="/calendario"
              element={
                <RutaPrivada>
                  <CalendarioCitas />
                </RutaPrivada>
              }
            />
            
            {/* Historial de Mantenimiento - Todos los roles */}
            <Route
              path="/historial"
              element={
                <RutaPrivada>
                  <HistorialMantenimiento />
                </RutaPrivada>
              }
            />
            
            {/* Páginas específicas por rol */}
            <Route
              path="/cliente"
              element={
                <RutaPrivada rol="cliente">
                  <Cliente />
                </RutaPrivada>
              }
            />
            <Route
              path="/mecanico"
              element={
                <RutaPrivada rol="mecanico">
                  <Mecanico />
                </RutaPrivada>
              }
            />
            <Route
              path="/jefe-taller"
              element={
                <RutaPrivada rol="jefe_taller">
                  <JefeTaller />
                </RutaPrivada>
              }
            />
            
            {/* Ruta de diagnóstico - Solo para desarrollo */}
            <Route
              path="/diagnostico"
              element={
                <RutaPrivada>
                  <Diagnostico />
                </RutaPrivada>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;