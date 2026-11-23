const express = require('express');
const authRoutes = require('./auth.routes');
const readingRoutes = require('./reading.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/readings', readingRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
