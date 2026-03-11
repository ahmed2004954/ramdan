const prisma = require('../config/prisma');

async function renderPlayersIndex(req, res, next) {
  try {
    const [players, teams] = await Promise.all([
      prisma.player.findMany({
        include: {
          team: true,
        },
        orderBy: [{ team: { name: 'asc' } }, { name: 'asc' }],
      }),
      prisma.team.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    res.render('admin/players/index', {
      title: 'إدارة اللاعبين',
      layout: 'layouts/admin',
      players,
      teams,
    });
  } catch (error) {
    next(error);
  }
}

async function createPlayer(req, res, next) {
  try {
    await prisma.player.create({
      data: {
        name: req.body.name.trim(),
        teamId: Number(req.body.teamId),
      },
    });

    req.flash('success', 'تمت إضافة اللاعب.');
    res.redirect('/admin/players');
  } catch (error) {
    next(error);
  }
}

async function updatePlayer(req, res, next) {
  try {
    await prisma.player.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        name: req.body.name.trim(),
        teamId: Number(req.body.teamId),
      },
    });

    req.flash('success', 'تم تحديث بيانات اللاعب.');
    res.redirect('/admin/players');
  } catch (error) {
    next(error);
  }
}

async function deletePlayer(req, res, next) {
  try {
    await prisma.player.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    req.flash('success', 'تم حذف اللاعب.');
    res.redirect('/admin/players');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  renderPlayersIndex,
  createPlayer,
  updatePlayer,
  deletePlayer,
};
