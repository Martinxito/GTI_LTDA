const express = require('express');
const authenticate = require('../../middleware/auth');
const service = require('./service');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const clients = await service.listClients();
    res.json(clients);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const client = await service.getClient(req.params.id);
    res.json(client);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const client = await service.createClient(req.body);
    res.status(201).json(client);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const result = await service.updateClient(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await service.deleteClient(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
