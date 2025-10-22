const express = require('express');
const authenticate = require('../../middleware/auth');
const service = require('./service');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const items = await service.listItems();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const item = await service.createItem(req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const item = await service.updateItem(req.params.id, req.body);
    res.json(item);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await service.deleteItem(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
