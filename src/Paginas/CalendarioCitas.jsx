import { useState, useEffect } from "react";
import Menu from "../components/Menu";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { citasService } from "../Servicios/api";

function CalendarioCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadCitas();
  }, []);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const data = await citasService.getAll();
      setCitas(data);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate.getDate(),
        fullDate: prevDate,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      const today = new Date();
      days.push({
        date: day,
        fullDate,
        isCurrentMonth: true,
        isToday: fullDate.toDateString() === today.toDateString()
      });
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: day,
        fullDate: nextDate,
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    return days;
  };

  const getCitasForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return citas.filter(cita => cita && cita.fecha_hora && cita.fecha_hora.startsWith(dateStr));
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'programada': return '#3b82f6';
      case 'en_progreso': return '#f59e0b';
      case 'completada': return '#10b981';
      case 'cancelada': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div>
      <Menu />
      
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1e293b", margin: 0 }}>
            📆 Calendario de Citas
          </h1>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <Button
              variant="secondary"
              onClick={() => navigateMonth(-1)}
            >
              ⬅️ Anterior
            </Button>
            <div style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1e293b", minWidth: "200px", textAlign: "center" }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <Button
              variant="secondary"
              onClick={() => navigateMonth(1)}
            >
              Siguiente ➡️
            </Button>
          </div>
        </div>

        <Card>
          {loading && (
            <p style={{ marginBottom: "1rem", color: "#64748b" }}>Cargando citas...</p>
          )}
          {/* Encabezados de días */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "1px",
            backgroundColor: "#e2e8f0",
            borderRadius: "8px",
            overflow: "hidden"
          }}>
            {dayNames.map(day => (
              <div
                key={day}
                style={{
                  padding: "0.75rem",
                  backgroundColor: "#f8fafc",
                  textAlign: "center",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  color: "#64748b"
                }}
              >
                {day}
              </div>
            ))}
            
            {/* Días del calendario */}
            {days.map((day, index) => {
              const citasDelDia = getCitasForDate(day.fullDate);
              
              return (
                <div
                  key={index}
                  style={{
                    minHeight: "120px",
                    padding: "0.5rem",
                    backgroundColor: day.isCurrentMonth ? "white" : "#f8fafc",
                    border: day.isToday ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    borderRadius: day.isToday ? "4px" : "0",
                    opacity: day.isCurrentMonth ? 1 : 0.5
                  }}
                >
                  <div style={{
                    fontSize: "0.875rem",
                    fontWeight: day.isToday ? "700" : "600",
                    color: day.isToday ? "#2563eb" : "#1e293b",
                    marginBottom: "0.5rem"
                  }}>
                    {day.date}
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {citasDelDia.slice(0, 3).map(cita => (
                      <div
                        key={cita.id}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: getEstadoColor(cita.estado) + "20",
                          color: getEstadoColor(cita.estado),
                          borderRadius: "4px",
                          border: `1px solid ${getEstadoColor(cita.estado)}40`,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                        title={`${cita.cliente_nombre || "Cliente"} - ${cita.servicio_nombre || "Servicio"} - ${new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        {new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {cita.cliente_nombre || "Cliente"}
                      </div>
                    ))}
                    {citasDelDia.length > 3 && (
                      <div style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        textAlign: "center",
                        fontStyle: "italic"
                      }}>
                        +{citasDelDia.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Leyenda */}
        <Card title="Leyenda" className="mt-6">
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#3b82f6",
                borderRadius: "2px"
              }}></div>
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Programada</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#f59e0b",
                borderRadius: "2px"
              }}></div>
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>En Progreso</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#10b981",
                borderRadius: "2px"
              }}></div>
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Completada</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#ef4444",
                borderRadius: "2px"
              }}></div>
              <span style={{ fontSize: "0.875rem", color: "#64748b" }}>Cancelada</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CalendarioCitas;