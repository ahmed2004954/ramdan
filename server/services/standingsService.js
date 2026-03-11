const { MatchStage, MatchStatus } = require('@prisma/client');

function compareStandings(a, b) {
  if (b.points !== a.points) {
    return b.points - a.points;
  }

  const aDiff = a.goalsFor - a.goalsAgainst;
  const bDiff = b.goalsFor - b.goalsAgainst;

  if (bDiff !== aDiff) {
    return bDiff - aDiff;
  }

  if (b.goalsFor !== a.goalsFor) {
    return b.goalsFor - a.goalsFor;
  }

  return a.teamId - b.teamId;
}

async function recalculateStandingsForGroup(prisma, groupName) {
  if (!groupName) {
    return;
  }

  const matches = await prisma.match.findMany({
    where: {
      groupName,
      stage: MatchStage.GROUP,
    },
  });

  if (!matches.length) {
    await prisma.standing.deleteMany({ where: { groupName } });
    return;
  }

  const teamIds = [...new Set(matches.flatMap((match) => [match.teamAId, match.teamBId]))];
  const table = new Map(
    teamIds.map((teamId) => [
      teamId,
      {
        groupName,
        teamId,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    ]),
  );

  matches
    .filter((match) => match.status === MatchStatus.FINISHED && match.scoreA !== null && match.scoreB !== null)
    .forEach((match) => {
      const teamA = table.get(match.teamAId);
      const teamB = table.get(match.teamBId);

      teamA.played += 1;
      teamB.played += 1;
      teamA.goalsFor += match.scoreA;
      teamA.goalsAgainst += match.scoreB;
      teamB.goalsFor += match.scoreB;
      teamB.goalsAgainst += match.scoreA;

      if (match.scoreA > match.scoreB) {
        teamA.wins += 1;
        teamB.losses += 1;
        teamA.points += 3;
      } else if (match.scoreA < match.scoreB) {
        teamB.wins += 1;
        teamA.losses += 1;
        teamB.points += 3;
      } else {
        teamA.draws += 1;
        teamB.draws += 1;
        teamA.points += 1;
        teamB.points += 1;
      }
    });

  const standings = Array.from(table.values()).sort(compareStandings);

  await prisma.$transaction([
    prisma.standing.deleteMany({ where: { groupName } }),
    prisma.standing.createMany({
      data: standings,
    }),
  ]);
}

async function recalculateStandingsForGroups(prisma, groupNames) {
  const uniqueGroups = [...new Set(groupNames.filter(Boolean))];

  for (const groupName of uniqueGroups) {
    await recalculateStandingsForGroup(prisma, groupName);
  }
}

module.exports = {
  compareStandings,
  recalculateStandingsForGroup,
  recalculateStandingsForGroups,
};
