const prisma = require('../config/prisma');
const {
  getHomePageData,
  getGroupsPageData,
  getMatchesPageData,
  getKnockoutsPageData,
  getScorersPageData,
  getTeamPageData,
} = require('../services/publicService');

async function renderHomePage(req, res, next) {
  try {
    const data = await getHomePageData(prisma);
    res.render('pages/home', {
      title: 'دوري رمضان لكرة القدم',
      layout: 'layouts/main',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

async function renderGroupsPage(req, res, next) {
  try {
    const groups = await getGroupsPageData(prisma);
    res.render('pages/groups', {
      title: 'المجموعات',
      layout: 'layouts/main',
      groups,
    });
  } catch (error) {
    next(error);
  }
}

async function renderMatchesPage(req, res, next) {
  try {
    const filter = req.query.filter || 'all';
    const data = await getMatchesPageData(prisma, filter);
    res.render('pages/matches', {
      title: 'المباريات',
      layout: 'layouts/main',
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

async function renderKnockoutsPage(req, res, next) {
  try {
    const stages = await getKnockoutsPageData(prisma);
    res.render('pages/knockouts', {
      title: 'الأدوار الإقصائية',
      layout: 'layouts/main',
      stages,
    });
  } catch (error) {
    next(error);
  }
}

async function renderScorersPage(req, res, next) {
  try {
    const scorers = await getScorersPageData(prisma);
    res.render('pages/scorers', {
      title: 'الهدافون',
      layout: 'layouts/main',
      scorers,
    });
  } catch (error) {
    next(error);
  }
}

async function renderTeamPage(req, res, next) {
  try {
    const data = await getTeamPageData(prisma, req.params.id);

    if (!data) {
      return res.status(404).render('pages/not-found', {
        title: 'الفريق غير موجود',
        layout: 'layouts/main',
      });
    }

    return res.render('pages/teams/show', {
      title: data.team.name,
      layout: 'layouts/main',
      ...data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderHomePage,
  renderGroupsPage,
  renderMatchesPage,
  renderKnockoutsPage,
  renderScorersPage,
  renderTeamPage,
};
