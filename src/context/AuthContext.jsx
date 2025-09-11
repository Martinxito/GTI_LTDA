import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (usuario, password) => {
    // Aquí iría la llamada real a tu backend
    if (usuario === "admin" && password === "admin") {
      setUser({ nombre: "Martín", rol: "jefe-taller" });
      return { success: true, rol: "jefe-taller" };
    } else if (usuario === "cliente" && password === "cliente") {
      setUser({ nombre: "Cliente", rol: "cliente" });
      return { success: true, rol: "cliente" };
    } else if (usuario === "mecanico" && password === "mecanico") {
      setUser({ nombre: "Mecánico", rol: "mecanico" });
      return { success: true, rol: "mecanico" };
    }
    return { success: false };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}