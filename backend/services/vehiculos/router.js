const express = require('express');
const authenticate = require('../../middleware/auth');
const service = require('./service');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const vehicles = await service.listVehicles(req.user);

    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

router.get('/usuario/:usuarioId', async (req, res, next) => {
  try {
    const { user } = req;
    const { usuarioId } = req.params;

    const vehicles = await service.listVehiclesByUser(usuarioId, user);
    res.json(vehicles);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await service.getVehicle(req.params.id, req.user);
    res.json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/historial', async (req, res, next) => {
  try {
    const historial = await service.getVehicleHistory(req.params.id, req.user);
    res.json(historial);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const vehicle = await service.createVehicle(req.body, req.user);
    res.status(201).json(vehicle);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateVehicle(req.params.id, req.body, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await service.deleteVehicle(req.params.id, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
