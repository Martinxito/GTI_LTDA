const express = require('express');
const authenticate = require('../../middleware/auth');
const {
  registerUser,
  authenticateUser,
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser
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
router.get('/', authenticate, async (req, res, next) => {
  try {
    const usuarios = await getAllUsers();
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
});

// Crear un usuario (gestión interna)
router.post('/', authenticate, async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

// Obtener usuario por ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Actualizar usuario
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await updateUser(req.params.id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Eliminar (desactivar) usuario
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


