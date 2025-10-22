import { Router } from "express";
const router = Router();
import { registerUser, authenticateUser, getAllUsers } from "./service";

// Registrar un nuevo usuario
router.post("/register", async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
});

// Iniciar sesión
router.post("/login", async (req, res, next) => {
  try {
    const payload = await authenticateUser(req.body);
    res.json(payload);
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
});

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await getAllUsers();
    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

const usuariosRouter = require("./services/identity/router");

app.use("/api/usuarios", usuariosRouter);

module.exports = router;


