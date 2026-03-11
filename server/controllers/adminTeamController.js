const prisma = require('../config/prisma');

async function renderTeamsIndex(req, res, next) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.render('admin/teams/index', {
      title: 'إدارة الفرق',
      layout: 'layouts/admin',
      teams,
    });
  } catch (error) {
    next(error);
  }
}

async function renderTeamDetailsPage(req, res, next) {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        players: {
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!team) {
      req.flash('error', 'الفريق غير موجود.');
      return res.redirect('/admin/teams');
    }

    return res.render('admin/teams/show', {
      title: team.name,
      layout: 'layouts/admin',
      team,
    });
  } catch (error) {
    return next(error);
  }
}

function redirectToTeamPlayersPage(req, res) {
  return res.redirect(`/admin/teams/${req.params.id}/players`);
}

function renderNewTeamPage(req, res) {
  res.render('admin/teams/form', {
    title: 'إضافة فريق',
    layout: 'layouts/admin',
    team: null,
    formAction: '/admin/teams',
  });
}

async function createTeam(req, res, next) {
  try {
    const logoPath = req.body.logoPath?.trim() || '/images/teams/default.svg';

    await prisma.team.create({
      data: {
        name: req.body.name.trim(),
        logoPath,
      },
    });

    req.flash('success', 'تمت إضافة الفريق بنجاح.');
    res.redirect('/admin/teams');
  } catch (error) {
    next(error);
  }
}

async function renderEditTeamPage(req, res, next) {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!team) {
      req.flash('error', 'الفريق غير موجود.');
      return res.redirect('/admin/teams');
    }

    return res.render('admin/teams/form', {
      title: 'تعديل فريق',
      layout: 'layouts/admin',
      team,
      formAction: `/admin/teams/${team.id}`,
    });
  } catch (error) {
    return next(error);
  }
}

async function createTeamPlayer(req, res, next) {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!team) {
      req.flash('error', 'الفريق غير موجود.');
      return res.redirect('/admin/teams');
    }

    await prisma.player.create({
      data: {
        name: req.body.name.trim(),
        teamId: team.id,
      },
    });

    req.flash('success', 'تمت إضافة اللاعب إلى الفريق.');
    return res.redirect(`/admin/teams/${team.id}/players`);
  } catch (error) {
    return next(error);
  }
}

async function updateTeam(req, res, next) {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!team) {
      req.flash('error', 'الفريق غير موجود.');
      return res.redirect('/admin/teams');
    }

    const data = {
      name: req.body.name.trim(),
      logoPath: req.body.logoPath?.trim() || team.logoPath || '/images/teams/default.svg',
    };

    await prisma.team.update({
      where: {
        id: team.id,
      },
      data,
    });

    req.flash('success', 'تم تحديث بيانات الفريق.');
    return res.redirect('/admin/teams');
  } catch (error) {
    return next(error);
  }
}

async function deleteTeamPlayer(req, res, next) {
  try {
    const teamId = Number(req.params.id);
    const playerId = Number(req.params.playerId);

    const player = await prisma.player.findUnique({
      where: {
        id: playerId,
      },
    });

    if (!player || player.teamId !== teamId) {
      req.flash('error', 'اللاعب غير موجود داخل هذا الفريق.');
      return res.redirect(`/admin/teams/${teamId}/players`);
    }

    await prisma.player.delete({
      where: {
        id: player.id,
      },
    });

    req.flash('success', 'تم حذف اللاعب من الفريق.');
    return res.redirect(`/admin/teams/${teamId}/players`);
  } catch (error) {
    return next(error);
  }
}

async function deleteTeam(req, res, next) {
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!team) {
      req.flash('error', 'الفريق غير موجود.');
      return res.redirect('/admin/teams');
    }

    await prisma.team.delete({
      where: {
        id: team.id,
      },
    });

    req.flash('success', 'تم حذف الفريق.');
    return res.redirect('/admin/teams');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderTeamsIndex,
  redirectToTeamPlayersPage,
  renderTeamDetailsPage,
  renderNewTeamPage,
  createTeam,
  createTeamPlayer,
  renderEditTeamPage,
  updateTeam,
  deleteTeamPlayer,
  deleteTeam,
};
