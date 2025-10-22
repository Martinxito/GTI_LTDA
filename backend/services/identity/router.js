const express = require('express');
const service = require('./service');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const user = await service.registerUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const payload = await service.authenticateUser(req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
