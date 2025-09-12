const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Ejemplo de ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

// Rutas de inventario
const inventarioRoutes = require('./rutas/inventario');
app.use('/api/inventario', inventarioRoutes);

// Rutas de usuarios
const usuariosRoutes = require('./rutas/usuarios');
app.use('/api/usuarios', usuariosRoutes);

// Rutas de clientes
const clientesRoutes = require('./rutas/clientes');
app.use('/api/clientes', clientesRoutes);

// Rutas de vehículos
const vehiculosRoutes = require('./rutas/vehiculos');
app.use('/api/vehiculos', vehiculosRoutes);

// Rutas de servicios
const serviciosRoutes = require('./rutas/servicios');
app.use('/api/servicios', serviciosRoutes);

// Rutas de citas
const citasRoutes = require('./rutas/citas');
app.use('/api/citas', citasRoutes);

const PORT = 3001; // Usa 3001 o cualquier otro puerto libre
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});