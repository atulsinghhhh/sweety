const express = require('express');
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate({ body: registerSchema }), asyncHandler(controller.register));
router.post('/login', validate({ body: loginSchema }), asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;
