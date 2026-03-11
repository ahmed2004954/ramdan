const { MatchStage } = require('@prisma/client');
const { recalculateStandingsForGroups } = require('./standingsService');

function normalizeMatchPayload(body) {
  const teamAId = Number(body.teamAId);
  const teamBId = Number(body.teamBId);
  const stage = body.stage;
  const groupName = stage === MatchStage.GROUP ? body.groupName?.trim() : null;
  const roundOrder = Number(body.roundOrder || 0);
  const status = body.status;
  const dateTime = new Date(body.dateTime);

  if (!teamAId || !teamBId || Number.isNaN(teamAId) || Number.isNaN(teamBId)) {
    throw new Error('يجب اختيار الفريقين.');
  }

  if (teamAId === teamBId) {
    throw new Error('يجب أن يكون الفريقان مختلفين.');
  }

  if (Number.isNaN(dateTime.getTime())) {
    throw new Error('تاريخ المباراة غير صالح.');
  }

  let scoreA = body.scoreA === '' ? null : Number(body.scoreA);
  let scoreB = body.scoreB === '' ? null : Number(body.scoreB);

  if (status === 'FINISHED') {
    if (scoreA === null || scoreB === null || Number.isNaN(scoreA) || Number.isNaN(scoreB)) {
      throw new Error('يجب إدخال نتيجة صحيحة للمباراة المنتهية.');
    }
  }

  if (scoreA !== null && Number.isNaN(scoreA)) {
    scoreA = null;
  }

  if (scoreB !== null && Number.isNaN(scoreB)) {
    scoreB = null;
  }

  if (stage === MatchStage.GROUP && !groupName) {
    throw new Error('يجب اختيار المجموعة لمباريات المجموعات.');
  }

  return {
    teamAId,
    teamBId,
    stage,
    groupName,
    roundOrder,
    status,
    dateTime,
    scoreA,
    scoreB,
  };
}

async function createMatch(prisma, body) {
  const data = normalizeMatchPayload(body);
  const match = await prisma.match.create({ data });
  await recalculateStandingsForGroups(prisma, [data.groupName]);
  return match;
}

async function updateMatch(prisma, matchId, body) {
  const existingMatch = await prisma.match.findUnique({
    where: { id: Number(matchId) },
  });

  if (!existingMatch) {
    throw new Error('المباراة غير موجودة.');
  }

  const data = normalizeMatchPayload(body);
  const match = await prisma.match.update({
    where: { id: existingMatch.id },
    data,
  });

  await recalculateStandingsForGroups(prisma, [existingMatch.groupName, data.groupName]);
  return match;
}

async function deleteMatch(prisma, matchId) {
  const existingMatch = await prisma.match.findUnique({
    where: { id: Number(matchId) },
  });

  if (!existingMatch) {
    throw new Error('المباراة غير موجودة.');
  }

  await prisma.match.delete({
    where: {
      id: existingMatch.id,
    },
  });

  await recalculateStandingsForGroups(prisma, [existingMatch.groupName]);
}

async function saveGoals(prisma, matchId, entries) {
  const match = await prisma.match.findUnique({
    where: {
      id: Number(matchId),
    },
    include: {
      teamA: { include: { players: true } },
      teamB: { include: { players: true } },
    },
  });

  if (!match) {
    throw new Error('المباراة غير موجودة.');
  }

  const validPlayerIds = new Set([
    ...match.teamA.players.map((player) => player.id),
    ...match.teamB.players.map((player) => player.id),
  ]);
  const validTeamIds = new Set([match.teamAId, match.teamBId]);

  const normalizedEntries = entries
    .map((entry) => ({
      playerId: Number(entry.playerId),
      teamId: Number(entry.teamId),
      count: Number(entry.count),
    }))
    .filter((entry) => entry.count > 0);

  normalizedEntries.forEach((entry) => {
    if (!validPlayerIds.has(entry.playerId) || !validTeamIds.has(entry.teamId)) {
      throw new Error('بيانات هدافي المباراة غير صالحة.');
    }
  });

  if (match.scoreA !== null && match.scoreB !== null) {
    const teamAGoals = normalizedEntries
      .filter((entry) => entry.teamId === match.teamAId)
      .reduce((sum, entry) => sum + entry.count, 0);
    const teamBGoals = normalizedEntries
      .filter((entry) => entry.teamId === match.teamBId)
      .reduce((sum, entry) => sum + entry.count, 0);

    if (teamAGoals !== match.scoreA || teamBGoals !== match.scoreB) {
      throw new Error('مجموع أهداف اللاعبين يجب أن يطابق نتيجة المباراة.');
    }
  }

  await prisma.$transaction([
    prisma.goal.deleteMany({ where: { matchId: match.id } }),
    ...(normalizedEntries.length
      ? [
          prisma.goal.createMany({
            data: normalizedEntries.map((entry) => ({
              matchId: match.id,
              playerId: entry.playerId,
              teamId: entry.teamId,
              count: entry.count,
            })),
          }),
        ]
      : []),
  ]);
}

module.exports = {
  normalizeMatchPayload,
  createMatch,
  updateMatch,
  deleteMatch,
  saveGoals,
};
