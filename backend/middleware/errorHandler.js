const { ServiceError } = require('../services/utils/serviceError');

function errorHandler(err, req, res, next) {
  if (err instanceof ServiceError || err.name === 'ServiceError') {
    const response = { error: err.message };
    if (err.details) {
      response.details = err.details;
    }
    return res.status(err.status || 500).json(response);
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;
