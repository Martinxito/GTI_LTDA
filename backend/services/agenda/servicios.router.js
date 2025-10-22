const express = require('express');
const authenticate = require('../../middleware/auth');
const service = require('./servicios.service');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const servicios = await service.listServices();
    res.json(servicios);
  } catch (error) {
    next(error);
  }
});

router.get('/categoria/:categoria', async (req, res, next) => {
  try {
    const servicios = await service.listServicesByCategory(req.params.categoria);
    res.json(servicios);
  } catch (error) {
    next(error);
  }
});

router.get('/categorias/list', async (req, res, next) => {
  try {
    const categorias = await service.listCategories();
    res.json(categorias);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const servicio = await service.getService(req.params.id);
    res.json(servicio);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const servicio = await service.createService(req.body);
    res.status(201).json(servicio);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateService(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await service.deleteService(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
