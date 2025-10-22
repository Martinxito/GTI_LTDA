const usuariosRouter = require("./services/identity/router");

module.exports = {
  name: 'identity',
  routes: [
    { basePath: '/identity', router },
    { basePath: '/usuarios', router },
    { basePath: '/api/usuarios', router: usuariosRouter }
  ]
};
