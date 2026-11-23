const express = require('express');
const controller = require('../controllers/reading.controller');
const validate = require('../middleware/validate');
const requireAuth = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const {
  readingBodySchema,
  readingIdParamsSchema,
  listReadingsQuerySchema,
} = require('../validators/reading.validator');

const router = express.Router();

router.use(requireAuth);

router.post('/', validate({ body: readingBodySchema }), asyncHandler(controller.create));
router.get('/', validate({ query: listReadingsQuerySchema }), asyncHandler(controller.list));
router.get('/:id', validate({ params: readingIdParamsSchema }), asyncHandler(controller.getOne));
router.put(
  '/:id',
  validate({ params: readingIdParamsSchema, body: readingBodySchema }),
  asyncHandler(controller.update),
);
router.delete('/:id', validate({ params: readingIdParamsSchema }), asyncHandler(controller.remove));

module.exports = router;
