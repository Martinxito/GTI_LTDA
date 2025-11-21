const express = require('express');
const authenticate = require('../../middleware/auth');
const service = require('./citas.service');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const citas = await service.listAppointments(req.user);
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.get('/fecha/:fecha', async (req, res, next) => {
  try {
    const citas = await service.listAppointmentsByDate(req.params.fecha, req.user);
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.get('/mecanico/:mecanicoId', async (req, res, next) => {
  try {
    const citas = await service.listAppointmentsByMechanic(req.params.mecanicoId, req.user);
    res.json(citas);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const cita = await service.getAppointment(req.params.id, req.user);
    res.json(cita);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const cita = await service.createAppointment(req.body, req.user);
    res.status(201).json(cita);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateAppointment(req.params.id, req.body, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/cancelar', async (req, res, next) => {
  try {
    const result = await service.cancelAppointment(req.params.id, req.body.observaciones, req.user);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
