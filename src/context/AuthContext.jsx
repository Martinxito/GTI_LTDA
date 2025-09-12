import { createContext, useContext, useState, useEffect } from "react";
import { authService, verifyToken, clearAuth } from "../Servicios/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay un usuario logueado al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      console.log('Inicializando autenticación...');
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('Token encontrado:', !!token);
      console.log('Usuario guardado:', !!savedUser);
      
      if (token && savedUser) {
        try {
          const isValid = await verifyToken();
          console.log('Token válido:', isValid);
          if (isValid) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
            console.log('Usuario restaurado:', userData);
          } else {
            console.log('Token inválido, limpiando...');
            clearAuth();
          }
        } catch (error) {
          console.error('Error verificando token:', error);
          clearAuth();
        }
      }
      setLoading(false);
      console.log('Inicialización de autenticación completada');
    };

    initAuth();
  }, []);

  const login = async (usuario, password) => {
    try {
      setLoading(true);
      console.log('Iniciando login para usuario:', usuario);
      const response = await authService.login(usuario, password);
      console.log('Respuesta del login:', response);
      
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      console.log('Usuario establecido:', response.user);
      return { success: true, rol: response.user.rol };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      await authService.register(userData);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}