async function getTopScorers(prisma, limit = 20) {
  const groupedGoals = await prisma.goal.groupBy({
    by: ['playerId', 'teamId'],
    _sum: {
      count: true,
    },
    orderBy: {
      _sum: {
        count: 'desc',
      },
    },
    take: limit,
  });

  if (!groupedGoals.length) {
    return [];
  }

  const players = await prisma.player.findMany({
    where: {
      id: {
        in: groupedGoals.map((goal) => goal.playerId),
      },
    },
    include: {
      team: true,
    },
  });

  const playerMap = new Map(players.map((player) => [player.id, player]));

  return groupedGoals.map((goal, index) => {
    const player = playerMap.get(goal.playerId);

    return {
      rank: index + 1,
      playerId: goal.playerId,
      playerName: player?.name || 'لاعب غير معروف',
      teamName: player?.team?.name || 'فريق غير معروف',
      goals: goal._sum.count || 0,
    };
  });
}

module.exports = {
  getTopScorers,
};
