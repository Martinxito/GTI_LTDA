const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mi_super_clave_secreta_2025_gti_ltda'; // Debe ser igual a la usada en usuarios.js

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
}

module.exports = verificarToken;