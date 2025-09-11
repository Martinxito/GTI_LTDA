import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./components/Menu";
import RutaPrivada from "./components/RutaPrivada";
import Login from "./paginas/Login";
import Cliente from "./paginas/Cliente";
import Mecanico from "./paginas/Mecanico";
import JefeTaller from "./paginas/JefeTaller";

function App() {
  return (
    <BrowserRouter>
      <Menu />
      <Routes>
        <Route path="/" element={<Login />} />
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
            <RutaPrivada rol="jefe-taller">
              <JefeTaller />
            </RutaPrivada>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
