const express = require('express');
const controller = require('../controllers/report.controller');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { reportQuerySchema } = require('../validators/report.validator');

const router = express.Router();

router.use(requireAuth);

const withDate = validate({ query: reportQuerySchema });

router.get('/daily', withDate, asyncHandler(controller.daily));
router.get('/month-to-date', withDate, asyncHandler(controller.monthToDate));
router.get('/monthly', withDate, asyncHandler(controller.monthly));

module.exports = router;
