import { useState } from "react";
import { FiPlayCircle, FiRefreshCcw, FiTool } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function Diagnostico() {
  const { user } = useAuth();
  const [diagnostico, setDiagnostico] = useState({});
  const [loading, setLoading] = useState(false);

  const ejecutarDiagnostico = async () => {
    setLoading(true);
    const resultados = {};

    try {
      // Probar servicios API
      const { usuariosService, vehiculosService, serviciosService, citasService } = await import("../Servicios/api");
      
      // Probar autenticación
      try {
        const token = localStorage.getItem('token');
        resultados.auth = token ? "Autenticación: token encontrado" : "Autenticación: no se encontró token";
      } catch (error) {
        resultados.auth = `Autenticación: error - ${error.message}`;
      }

      // Probar usuarios
      try {
        const usuarios = await usuariosService.getAll();
        resultados.usuarios = `Usuarios: ${Array.isArray(usuarios) ? usuarios.length : 'No es array'}`;
      } catch (error) {
        resultados.usuarios = `Usuarios: error - ${error.message}`;
      }

      // Probar vehículos
      try {
        const vehiculos = await vehiculosService.getAll();
        resultados.vehiculos = `Vehículos: ${Array.isArray(vehiculos) ? vehiculos.length : 'No es array'}`;
      } catch (error) {
        resultados.vehiculos = `Vehículos: error - ${error.message}`;
      }

      // Probar servicios
      try {
        const servicios = await serviciosService.getAll();
        resultados.servicios = `Servicios: ${Array.isArray(servicios) ? servicios.length : 'No es array'}`;
      } catch (error) {
        resultados.servicios = `Servicios: error - ${error.message}`;
      }

      // Probar citas
      try {
        const citas = await citasService.getAll();
        resultados.citas = `Citas: ${Array.isArray(citas) ? citas.length : 'No es array'}`;
      } catch (error) {
        resultados.citas = `Citas: error - ${error.message}`;
      }

    } catch (error) {
      resultados.error = `Diagnóstico general: error - ${error.message}`;
    }

    setDiagnostico(resultados);
    setLoading(false);
  };

  return (
    <div>
      <Menu />
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem"
          }}
        >
          <FiTool size={26} color="#2563eb" />
          <span>Diagnóstico del sistema</span>
        </h1>
        
        <Card>
          <div style={{ marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>
              Información del Usuario
            </h3>
            <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
              <strong>Usuario:</strong> {user?.nombre || 'N/A'}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
              <strong>Rol:</strong> {user?.rol || 'N/A'}
            </div>
            <div style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "0.5rem" }}>
              <strong>ID:</strong> {user?.id || 'N/A'}
            </div>
          </div>
          
          <Button
            onClick={ejecutarDiagnostico}
            disabled={loading}
            style={{ marginBottom: "1rem" }}
          >
            {loading ? (
              <>
                <FiRefreshCcw size={16} />
                <span>Ejecutando...</span>
              </>
            ) : (
              <>
                <FiPlayCircle size={16} />
                <span>Ejecutar diagnóstico</span>
              </>
            )}
          </Button>
          
          {Object.keys(diagnostico).length > 0 && (
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", marginBottom: "1rem" }}>
                Resultados del Diagnóstico
              </h3>
              {Object.entries(diagnostico).map(([key, value]) => (
                <div key={key} style={{ 
                  fontSize: "0.875rem", 
                  color: "#64748b", 
                  marginBottom: "0.5rem",
                  padding: "0.5rem",
                  backgroundColor: "#f8fafc",
                  borderRadius: "4px"
                }}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Diagnostico;
