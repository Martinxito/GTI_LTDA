import React, { useState, useEffect, useCallback } from 'react';
import { citasService } from '../Servicios/api';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Alert } from './ui/Alert';

const Calendar = ({ onDateSelect, onAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('month'); // 'month' o 'week'

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (view === 'month') {
        // Cargar citas del mes actual
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;
        
        const citas = await citasService.getByDateRange(startDate, endDate);
        setAppointments(citas);
      } else {
        // Cargar citas de la semana actual
        const startOfWeek = getStartOfWeek(currentDate);
        const endOfWeek = getEndOfWeek(currentDate);
        
        const citas = await citasService.getByDateRange(
          startOfWeek.toISOString().split('T')[0],
          endOfWeek.toISOString().split('T')[0]
        );
        setAppointments(citas);
      }
    } catch (error) {
      setError('Error al cargar citas: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getEndOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return new Date(d.setDate(diff));
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
        date: prevDate,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      days.push({
        date,
        isCurrentMonth: true,
        isToday
      });
    }

    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = getStartOfWeek(date);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday: day.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(appointment => 
      appointment.fecha_hora.startsWith(dateStr)
    );
  };

  const getAppointmentColor = (estado) => {
    switch (estado) {
      case 'programada':
        return 'bg-blue-100 text-blue-800';
      case 'en_progreso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateWeek = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction * 7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const handleAppointmentClick = (appointment) => {
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day.date);
          return (
            <div
              key={index}
              className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
              } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}`}
              onClick={() => handleDateClick(day.date)}
            >
              <div className={`text-sm ${day.isToday ? 'font-bold text-blue-600' : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1 mt-1">
                {dayAppointments.slice(0, 3).map(appointment => (
                  <div
                    key={appointment.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer ${getAppointmentColor(appointment.estado)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAppointmentClick(appointment);
                    }}
                    title={`${appointment.usuario_nombre || 'Usuario'} - ${appointment.servicio_nombre || 'Servicio'}`}
                  >
                    {new Date(appointment.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day.date);
          return (
            <div
              key={index}
              className={`min-h-32 p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                day.isToday ? 'bg-blue-50 border-blue-300' : ''
              }`}
              onClick={() => handleDateClick(day.date)}
            >
              <div className={`text-sm font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
                {day.date.getDate()}
              </div>
              <div className="space-y-1 mt-2">
                {dayAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className={`text-xs p-2 rounded cursor-pointer ${getAppointmentColor(appointment.estado)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAppointmentClick(appointment);
                    }}
                  >
                    <div className="font-medium">
                      {new Date(appointment.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="truncate">
                      {appointment.usuario_nombre || 'Usuario'}
                    </div>
                    <div className="truncate text-xs opacity-75">
                      {appointment.servicio_nombre || 'Servicio'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card title="Calendario de Citas">
      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Controles del calendario */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            {view === 'month' 
              ? `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : `Semana del ${getStartOfWeek(currentDate).toLocaleDateString('es-ES')}`
            }
          </h2>
          <div className="flex gap-2">
            <Button
              variant={view === 'month' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setView('month')}
            >
              Mes
            </Button>
            <Button
              variant={view === 'week' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setView('week')}
            >
              Semana
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={view === 'month' ? () => navigateMonth(-1) : () => navigateWeek(-1)}
          >
            ←
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={goToToday}
          >
            Hoy
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={view === 'month' ? () => navigateMonth(1) : () => navigateWeek(1)}
          >
            →
          </Button>
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>Programada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-100 rounded"></div>
          <span>En Progreso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>Completada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 rounded"></div>
          <span>Cancelada</span>
        </div>
      </div>

      {/* Vista del calendario */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando calendario...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {view === 'month' ? renderMonthView() : renderWeekView()}
        </div>
      )}
    </Card>
  );
};

export default Calendar;
