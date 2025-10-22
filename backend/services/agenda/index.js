const citasRouter = require('./citas.router');
const serviciosRouter = require('./servicios.router');

module.exports = {
  name: 'agenda',
  routes: [
    { basePath: '/agenda/citas', router: citasRouter },
    { basePath: '/citas', router: citasRouter },
    { basePath: '/agenda/servicios', router: serviciosRouter },
    { basePath: '/servicios', router: serviciosRouter }
  ]
};
