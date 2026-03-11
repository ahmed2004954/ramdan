const { MatchStage, MatchStatus } = require('@prisma/client');
const { getTopScorers } = require('./scorersService');
const { compareStandings } = require('./standingsService');
const { getFilterRange } = require('../utils/date');
const { stageLabels } = require('../config/constants');

async function getHomePageData(prisma) {
  const [upcomingMatches, latestResults] = await Promise.all([
    prisma.match.findMany({
      where: {
        OR: [{ status: MatchStatus.UPCOMING }, { status: MatchStatus.LIVE }],
      },
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: {
        dateTime: 'asc',
      },
      take: 6,
    }),
    prisma.match.findMany({
      where: {
        status: MatchStatus.FINISHED,
      },
      include: {
        teamA: true,
        teamB: true,
      },
      orderBy: {
        dateTime: 'desc',
      },
      take: 6,
    }),
  ]);

  return {
    upcomingMatches,
    latestResults,
  };
}

async function getGroupsPageData(prisma) {
  const standings = await prisma.standing.findMany({
    include: {
      team: true,
    },
  });

  const groupsMap = standings.reduce((accumulator, standing) => {
    if (!accumulator[standing.groupName]) {
      accumulator[standing.groupName] = [];
    }

    accumulator[standing.groupName].push(standing);
    return accumulator;
  }, {});

  return Object.entries(groupsMap)
    .sort(([nameA], [nameB]) => nameA.localeCompare(nameB, 'ar'))
    .map(([groupName, rows]) => ({
      groupName,
      rows: rows.sort(compareStandings),
    }));
}

async function getMatchesPageData(prisma, filter = 'all') {
  const range = getFilterRange(filter);
  const where = {};

  if (range) {
    where.dateTime = {
      gte: range.start,
      lte: range.end,
    };
  }

  const matches = await prisma.match.findMany({
    where,
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: {
      dateTime: 'asc',
    },
  });

  return {
    selectedFilter: filter,
    matches,
  };
}

async function getKnockoutsPageData(prisma) {
  const matches = await prisma.match.findMany({
    where: {
      stage: {
        in: [MatchStage.R16, MatchStage.QF, MatchStage.SF, MatchStage.FINAL],
      },
    },
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: [{ stage: 'asc' }, { roundOrder: 'asc' }, { dateTime: 'asc' }],
  });

  return ['R16', 'QF', 'SF', 'FINAL'].map((stage) => ({
    key: stage,
    label: stageLabels[stage],
    matches: matches.filter((match) => match.stage === stage),
  }));
}

async function getScorersPageData(prisma) {
  return getTopScorers(prisma, 30);
}

async function getTeamPageData(prisma, teamId) {
  const team = await prisma.team.findUnique({
    where: {
      id: Number(teamId),
    },
    include: {
      players: {
        orderBy: {
          name: 'asc',
        },
      },
      standings: true,
    },
  });

  if (!team) {
    return null;
  }

  const matches = await prisma.match.findMany({
    where: {
      OR: [{ teamAId: team.id }, { teamBId: team.id }],
    },
    include: {
      teamA: true,
      teamB: true,
    },
    orderBy: {
      dateTime: 'desc',
    },
    take: 6,
  });

  return {
    team,
    standing: team.standings[0] || {
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      points: 0,
    },
    matches,
  };
}

async function getAdminDashboardData(prisma) {
  const [teamsCount, playersCount, matchesCount, goalsAggregate] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.match.count(),
    prisma.goal.aggregate({
      _sum: {
        count: true,
      },
    }),
  ]);

  return {
    stats: [
      { label: 'عدد الفرق', value: teamsCount },
      { label: 'عدد اللاعبين', value: playersCount },
      { label: 'عدد المباريات', value: matchesCount },
      { label: 'عدد الأهداف', value: goalsAggregate._sum.count || 0 },
    ],
  };
}

module.exports = {
  getHomePageData,
  getGroupsPageData,
  getMatchesPageData,
  getKnockoutsPageData,
  getScorersPageData,
  getTeamPageData,
  getAdminDashboardData,
};
