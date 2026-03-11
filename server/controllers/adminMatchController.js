const { MatchStage } = require('@prisma/client');
const prisma = require('../config/prisma');
const { groupNames } = require('../config/constants');
const { createMatch, updateMatch, deleteMatch, saveGoals } = require('../services/matchService');

async function renderMatchesIndex(req, res, next) {
  try {
    const matches = await prisma.match.findMany({
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    res.render('admin/matches/index', {
      title: 'إدارة المباريات',
      layout: 'layouts/admin',
      matches,
      stageOptions: Object.values(MatchStage),
    });
  } catch (error) {
    next(error);
  }
}

async function renderNewMatchPage(req, res, next) {
  try {
    const teams = await prisma.team.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.render('admin/matches/form', {
      title: 'إضافة مباراة',
      layout: 'layouts/admin',
      match: null,
      teams,
      groupNames,
      stageOptions: Object.values(MatchStage),
      goalPlayers: [],
      teamAGoalPlayers: [],
      teamBGoalPlayers: [],
      goalMap: new Map(),
      formAction: '/admin/matches',
      goalsAction: null,
    });
  } catch (error) {
    next(error);
  }
}

async function createMatchAction(req, res, next) {
  try {
    const match = await createMatch(prisma, req.body);
    req.flash('success', 'تمت إضافة المباراة.');
    res.redirect(`/admin/matches/${match.id}/edit`);
  } catch (error) {
    next(error);
  }
}

async function renderEditMatchPage(req, res, next) {
  try {
    const [match, teams] = await Promise.all([
      prisma.match.findUnique({
        where: {
          id: Number(req.params.id),
        },
        include: {
          teamA: {
            include: {
              players: true,
            },
          },
          teamB: {
            include: {
              players: true,
            },
          },
          goals: true,
        },
      }),
      prisma.team.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    if (!match) {
      req.flash('error', 'المباراة غير موجودة.');
      return res.redirect('/admin/matches');
    }

    const teamAGoalPlayers = match.teamA.players.map((player) => ({
      ...player,
      teamName: match.teamA.name,
      teamId: match.teamAId,
    }));

    const teamBGoalPlayers = match.teamB.players.map((player) => ({
      ...player,
      teamName: match.teamB.name,
      teamId: match.teamBId,
    }));

    const goalMap = new Map(match.goals.map((goal) => [goal.playerId, goal.count]));

    return res.render('admin/matches/form', {
      title: 'تعديل مباراة',
      layout: 'layouts/admin',
      match,
      teams,
      groupNames,
      stageOptions: Object.values(MatchStage),
      goalPlayers: [...teamAGoalPlayers, ...teamBGoalPlayers],
      teamAGoalPlayers,
      teamBGoalPlayers,
      goalMap,
      formAction: `/admin/matches/${match.id}`,
      goalsAction: `/admin/matches/${match.id}/goals`,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMatchAction(req, res, next) {
  try {
    await updateMatch(prisma, req.params.id, req.body);
    req.flash('success', 'تم تحديث المباراة.');
    res.redirect(`/admin/matches/${req.params.id}/edit`);
  } catch (error) {
    next(error);
  }
}

async function updateGoalsAction(req, res, next) {
  try {
    const playerIds = Array.isArray(req.body.playerId) ? req.body.playerId : [req.body.playerId];
    const teamIds = Array.isArray(req.body.teamId) ? req.body.teamId : [req.body.teamId];
    const counts = Array.isArray(req.body.count) ? req.body.count : [req.body.count];

    const entries = playerIds.map((playerId, index) => ({
      playerId,
      teamId: teamIds[index],
      count: counts[index],
    }));

    await saveGoals(prisma, req.params.id, entries);
    req.flash('success', 'تم تحديث هدافي المباراة.');
    res.redirect(`/admin/matches/${req.params.id}/edit`);
  } catch (error) {
    req.flash('error', error.message || 'تعذر تحديث هدافي المباراة.');
    res.redirect(`/admin/matches/${req.params.id}/edit`);
  }
}

async function deleteMatchAction(req, res, next) {
  try {
    await deleteMatch(prisma, req.params.id);
    req.flash('success', 'تم حذف المباراة.');
    res.redirect('/admin/matches');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderMatchesIndex,
  renderNewMatchPage,
  createMatchAction,
  renderEditMatchPage,
  updateMatchAction,
  updateGoalsAction,
  deleteMatchAction,
};
