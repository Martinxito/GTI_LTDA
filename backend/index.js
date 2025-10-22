const express = require('express');
const cors = require('cors');
const config = require('./config');
const services = require('./services');
const errorHandler = require('./middleware/errorHandler');

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

app.use(errorHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});

module.exports = app;
