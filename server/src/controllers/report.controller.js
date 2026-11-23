const reportService = require('../services/report.service');
const { todayInTimezone } = require('../utils/dates');

const selectedDate = (req) => req.validated.query.date || todayInTimezone();

async function daily(req, res) {
  res.json({ report: await reportService.dailyReport(req.user.id, selectedDate(req)) });
}

async function monthToDate(req, res) {
  res.json({ report: await reportService.monthToDateReport(req.user.id, selectedDate(req)) });
}

async function monthly(req, res) {
  res.json({ report: await reportService.monthlyReport(req.user.id, selectedDate(req)) });
}

module.exports = { daily, monthToDate, monthly };
