const prisma = require('../config/prisma');
const { getAdminDashboardData } = require('../services/publicService');

async function renderDashboard(req, res, next) {
  try {
    const data = await getAdminDashboardData(prisma);

    res.render('admin/dashboard', {
      title: 'لوحة التحكم',
      layout: 'layouts/admin',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderDashboard,
};
