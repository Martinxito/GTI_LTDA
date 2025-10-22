const router = require('./router');

module.exports = {
  name: 'identity',
  routes: [
    { basePath: '/identity', router },
    { basePath: '/usuarios', router }
  ]
};
