const express = require('express');
const {
  registerUser,
  authenticateUser,
  getAllUsers
} = require('./service');

const router = express.Router();

// Registrar un nuevo usuario
router.post('/register', async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Iniciar sesión
router.post('/login', async (req, res, next) => {
  try {
    const payload = await authenticateUser(req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

// Obtener todos los usuarios
router.get('/', async (req, res, next) => {
  try {
    const usuarios = await getAllUsers();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


