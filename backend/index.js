const express = require('express');
const cors = require('cors');
const config = require('./config');
const services = require('./services');
const errorHandler = require('./middleware/errorHandler');
const { getAllUsers, registerUser, authenticateUser } = require('./service');
const identityRouter = require('./services/identity/router');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando', version: 'SOA' });
});

services.forEach((service) => {
  service.routes.forEach(({ basePath, router }) => {
    app.use(`/api${basePath}`, router);
  });
});

const userRouter = express.Router();

// Ruta para obtener todos los usuarios
userRouter.get('/', async (req, res) => {
  try {
    const usuarios = await getAllUsers();
    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Ruta para registrar un nuevo usuario
userRouter.post('/register', async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Ruta para iniciar sesión
userRouter.post('/login', async (req, res) => {
  try {
    const payload = await authenticateUser(req.body);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.use('/api/users', userRouter);
app.use('/api/usuarios', identityRouter);

app.use(errorHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

module.exports = app;
