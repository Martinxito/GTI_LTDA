import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { citasService, inventarioService } from '../Servicios/api';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Tipos de notificaciones
  const NOTIFICATION_TYPES = {
    STOCK_LOW: 'stock_low',
    APPOINTMENT_REMINDER: 'appointment_reminder',
    APPOINTMENT_TODAY: 'appointment_today',
    APPOINTMENT_OVERDUE: 'appointment_overdue',
    SYSTEM: 'system'
  };

  // Colores para cada tipo de notificación
  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.STOCK_LOW:
        return 'red';
      case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
        return 'blue';
      case NOTIFICATION_TYPES.APPOINTMENT_TODAY:
        return 'green';
      case NOTIFICATION_TYPES.APPOINTMENT_OVERDUE:
        return 'orange';
      case NOTIFICATION_TYPES.SYSTEM:
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Iconos para cada tipo de notificación
  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.STOCK_LOW:
        return '⚠️';
      case NOTIFICATION_TYPES.APPOINTMENT_REMINDER:
        return '🔔';
      case NOTIFICATION_TYPES.APPOINTMENT_TODAY:
        return '📅';
      case NOTIFICATION_TYPES.APPOINTMENT_OVERDUE:
        return '⏰';
      case NOTIFICATION_TYPES.SYSTEM:
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  // Eliminar notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // Agregar una nueva notificación
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-eliminar notificaciones después de 7 días
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, 7 * 24 * 60 * 60 * 1000);
  }, [removeNotification]);

  // Marcar notificación como leída
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Limpiar todas las notificaciones
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Verificar stock bajo
  const checkLowStock = useCallback(async () => {
    try {
      const inventario = await inventarioService.getAll();
      const stockBajo = inventario.filter(item =>
        item.cantidad <= (item.cantidad_minima || 5)
      );

      stockBajo.forEach(item => {
        addNotification({
          type: NOTIFICATION_TYPES.STOCK_LOW,
          title: 'Stock Bajo',
          message: `${item.nombre} tiene solo ${item.cantidad} unidades (mínimo: ${item.cantidad_minima || 5})`,
          data: { itemId: item.id, itemName: item.nombre }
        });
      });
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  }, [NOTIFICATION_TYPES.STOCK_LOW, addNotification]);

  // Verificar citas del día
  const checkTodaysAppointments = useCallback(async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const citasHoy = await citasService.getByDate(hoy);
      
      citasHoy.forEach(cita => {
        if (cita.estado === 'programada') {
          addNotification({
            type: NOTIFICATION_TYPES.APPOINTMENT_TODAY,
            title: 'Cita Programada Hoy',
            message: `${cita.cliente_nombre || 'Cliente'} - ${cita.servicio_nombre || 'Servicio'} a las ${new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
            data: { citaId: cita.id }
          });
        }
      });
    } catch (error) {
      console.error('Error checking today appointments:', error);
    }
  }, [NOTIFICATION_TYPES.APPOINTMENT_TODAY, addNotification]);

  // Verificar citas vencidas
  const checkOverdueAppointments = useCallback(async () => {
    try {
      const hoy = new Date();
      const citas = await citasService.getAll();
      
      const citasVencidas = citas.filter(cita => {
        const fechaCita = new Date(cita.fecha_hora);
        return fechaCita < hoy && cita.estado === 'programada';
      });

      citasVencidas.forEach(cita => {
        addNotification({
          type: NOTIFICATION_TYPES.APPOINTMENT_OVERDUE,
          title: 'Cita Vencida',
          message: `${cita.cliente_nombre || 'Cliente'} - ${cita.servicio_nombre || 'Servicio'} estaba programada para ${new Date(cita.fecha_hora).toLocaleDateString('es-ES')}`,
          data: { citaId: cita.id }
        });
      });
    } catch (error) {
      console.error('Error checking overdue appointments:', error);
    }
  }, [NOTIFICATION_TYPES.APPOINTMENT_OVERDUE, addNotification]);

  // Verificar todas las notificaciones
  const checkAllNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        checkLowStock(),
        checkTodaysAppointments(),
        checkOverdueAppointments()
      ]);
    } catch (error) {
      console.error('Error checking notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [checkLowStock, checkTodaysAppointments, checkOverdueAppointments]);

  // Verificar notificaciones cada 5 minutos
  useEffect(() => {
    checkAllNotifications();

    const interval = setInterval(checkAllNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkAllNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    checkAllNotifications,
    getNotificationColor,
    getNotificationIcon,
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
