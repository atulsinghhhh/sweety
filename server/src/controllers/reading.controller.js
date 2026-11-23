const readingService = require('../services/reading.service');

async function create(req, res) {
  const reading = await readingService.createReading(req.user.id, req.validated.body);
  res.status(201).json({ reading });
}

async function list(req, res) {
  const readings = await readingService.listReadings(req.user.id, req.validated.query);
  res.json({ readings });
}

async function getOne(req, res) {
  const reading = await readingService.getReading(req.user.id, req.validated.params.id);
  res.json({ reading });
}

async function update(req, res) {
  const reading = await readingService.updateReading(req.user.id, req.validated.params.id, req.validated.body);
  res.json({ reading });
}

async function remove(req, res) {
  await readingService.deleteReading(req.user.id, req.validated.params.id);
  res.status(204).end();
}

module.exports = { create, list, getOne, update, remove };
