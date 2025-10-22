const express = require('express');
const authenticate = require('../../middleware/auth');
const service = require('./service');

const router = express.Router();

router.use(authenticate);

router.get('/vehiculo/:vehiculoId', async (req, res, next) => {
  try {
    const historial = await service.listHistoryByVehicle(req.params.vehiculoId);
    res.json(historial);
  } catch (error) {
    next(error);
  }
});

router.post('/vehiculo/:vehiculoId', async (req, res, next) => {
  try {
    const entry = await service.registerHistoryEntry({
      ...req.body,
      vehiculo_id: req.params.vehiculoId
    });
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
