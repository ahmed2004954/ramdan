const { loadEnvIfExists } = require('../server/utils/loadEnv');

loadEnvIfExists();

const bcrypt = require('bcrypt');
const { PrismaClient, MatchStage, MatchStatus } = require('@prisma/client');
const { recalculateStandingsForGroups } = require('../server/services/standingsService');

const prisma = new PrismaClient();

async function main() {
  await prisma.goal.deleteMany();
  await prisma.standing.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.team.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence');

  await prisma.adminUser.create({
    data: {
      username: 'admin',
      passwordHash: await bcrypt.hash('ramadan2026', 10),
    },
  });

  const teamsData = [
    { name: 'الصقور', logoPath: '/images/teams/team-1.svg' },
    { name: 'النسور', logoPath: '/images/teams/team-2.svg' },
    { name: 'النخبة', logoPath: '/images/teams/team-3.svg' },
    { name: 'الفرسان', logoPath: '/images/teams/team-4.svg' },
    { name: 'النجوم', logoPath: '/images/teams/team-5.svg' },
    { name: 'العاصفة', logoPath: '/images/teams/team-6.svg' },
    { name: 'الأبطال', logoPath: '/images/teams/team-7.svg' },
    { name: 'الزعيم', logoPath: '/images/teams/team-8.svg' },
  ];

  const teams = [];
  for (const teamData of teamsData) {
    teams.push(await prisma.team.create({ data: teamData }));
  }

  const playersByTeam = {
    الصقور: ['أحمد سامي', 'خالد هشام', 'يوسف رامي', 'سيف مازن', 'محمود شادي'],
    النسور: ['عمر حسام', 'علي بهاء', 'إبراهيم مروان', 'طارق ياسين', 'بلال كريم'],
    النخبة: ['زياد علاء', 'آدم وليد', 'حازم تامر', 'كريم أشرف', 'فارس وائل'],
    الفرسان: ['حسن نادر', 'نور صالح', 'رامي يحيى', 'عاصم محمد', 'باسل جلال'],
    النجوم: ['سلمان رأفت', 'مصطفى عادل', 'إياد أحمد', 'شريف مؤمن', 'سامي وائل'],
    العاصفة: ['مؤيد كريم', 'عبدالله نزار', 'مهند ربيع', 'رائد حاتم', 'هيثم فادي'],
    الأبطال: ['حاتم أسامة', 'أمير خالد', 'ماهر يونس', 'نواف ناصر', 'إسماعيل طارق'],
    الزعيم: ['براء ممدوح', 'جاد شريف', 'تيم حسن', 'عدنان فهد', 'ليث وسام'],
  };

  const teamByName = Object.fromEntries(teams.map((team) => [team.name, team]));
  const playerLookup = {};

  for (const team of teams) {
    playerLookup[team.name] = {};
    for (const playerName of playersByTeam[team.name]) {
      const player = await prisma.player.create({
        data: {
          name: playerName,
          teamId: team.id,
        },
      });
      playerLookup[team.name][player.name] = player;
    }
  }

  const matches = [
    ['الصقور', 'النسور', 2, 1, '2026-03-05T20:30:00', 'المجموعة أ', MatchStage.GROUP, MatchStatus.FINISHED, 1, [['الصقور', 'أحمد سامي', 1], ['الصقور', 'يوسف رامي', 1], ['النسور', 'عمر حسام', 1]]],
    ['النخبة', 'الفرسان', 1, 1, '2026-03-05T22:15:00', 'المجموعة أ', MatchStage.GROUP, MatchStatus.FINISHED, 2, [['النخبة', 'زياد علاء', 1], ['الفرسان', 'حسن نادر', 1]]],
    ['النجوم', 'العاصفة', 3, 0, '2026-03-06T20:30:00', 'المجموعة ب', MatchStage.GROUP, MatchStatus.FINISHED, 3, [['النجوم', 'سلمان رأفت', 2], ['النجوم', 'إياد أحمد', 1]]],
    ['الأبطال', 'الزعيم', 2, 2, '2026-03-06T22:15:00', 'المجموعة ب', MatchStage.GROUP, MatchStatus.FINISHED, 4, [['الأبطال', 'حاتم أسامة', 1], ['الأبطال', 'أمير خالد', 1], ['الزعيم', 'براء ممدوح', 1], ['الزعيم', 'جاد شريف', 1]]],
    ['الصقور', 'النخبة', 1, 0, '2026-03-08T21:00:00', 'المجموعة أ', MatchStage.GROUP, MatchStatus.FINISHED, 5, [['الصقور', 'خالد هشام', 1]]],
    ['النسور', 'الفرسان', 0, 2, '2026-03-08T22:30:00', 'المجموعة أ', MatchStage.GROUP, MatchStatus.FINISHED, 6, [['الفرسان', 'نور صالح', 1], ['الفرسان', 'رامي يحيى', 1]]],
    ['النجوم', 'الأبطال', 1, 2, '2026-03-09T20:45:00', 'المجموعة ب', MatchStage.GROUP, MatchStatus.FINISHED, 7, [['النجوم', 'مصطفى عادل', 1], ['الأبطال', 'حاتم أسامة', 2]]],
    ['العاصفة', 'الزعيم', 1, 1, '2026-03-09T22:30:00', 'المجموعة ب', MatchStage.GROUP, MatchStatus.FINISHED, 8, [['العاصفة', 'مهند ربيع', 1], ['الزعيم', 'ليث وسام', 1]]],
    ['الصقور', 'الفرسان', null, null, '2026-03-12T21:30:00', 'المجموعة أ', MatchStage.GROUP, MatchStatus.UPCOMING, 9, []],
    ['النخبة', 'النسور', 0, 0, '2026-03-11T22:00:00', 'المجموعة أ', MatchStage.GROUP, MatchStatus.LIVE, 10, []],
    ['الأبطال', 'العاصفة', null, null, '2026-03-12T22:15:00', 'المجموعة ب', MatchStage.GROUP, MatchStatus.UPCOMING, 11, []],
    ['الزعيم', 'النجوم', null, null, '2026-03-13T21:15:00', 'المجموعة ب', MatchStage.GROUP, MatchStatus.UPCOMING, 12, []],
    ['الصقور', 'الزعيم', 2, 0, '2026-03-15T22:00:00', null, MatchStage.QF, MatchStatus.FINISHED, 1, [['الصقور', 'أحمد سامي', 1], ['الصقور', 'خالد هشام', 1]]],
    ['الأبطال', 'الفرسان', 1, 0, '2026-03-16T22:00:00', null, MatchStage.QF, MatchStatus.FINISHED, 2, [['الأبطال', 'حاتم أسامة', 1]]],
    ['النجوم', 'النخبة', 3, 2, '2026-03-17T22:00:00', null, MatchStage.QF, MatchStatus.FINISHED, 3, [['النجوم', 'سلمان رأفت', 1], ['النجوم', 'إياد أحمد', 1], ['النجوم', 'شريف مؤمن', 1], ['النخبة', 'كريم أشرف', 2]]],
    ['العاصفة', 'النسور', null, null, '2026-03-18T22:00:00', null, MatchStage.QF, MatchStatus.UPCOMING, 4, []],
    ['الصقور', 'الأبطال', null, null, '2026-03-21T22:00:00', null, MatchStage.SF, MatchStatus.UPCOMING, 1, []],
    ['النجوم', 'العاصفة', null, null, '2026-03-22T22:00:00', null, MatchStage.SF, MatchStatus.UPCOMING, 2, []],
    ['الصقور', 'النجوم', null, null, '2026-03-27T22:30:00', null, MatchStage.FINAL, MatchStatus.UPCOMING, 1, []],
  ];

  for (const entry of matches) {
    const [teamAName, teamBName, scoreA, scoreB, dateTime, groupName, stage, status, roundOrder, goals] = entry;
    const match = await prisma.match.create({
      data: {
        teamAId: teamByName[teamAName].id,
        teamBId: teamByName[teamBName].id,
        scoreA,
        scoreB,
        dateTime: new Date(dateTime),
        groupName,
        stage,
        status,
        roundOrder,
      },
    });

    if (goals.length) {
      await prisma.goal.createMany({
        data: goals.map(([teamName, playerName, count]) => ({
          matchId: match.id,
          teamId: teamByName[teamName].id,
          playerId: playerLookup[teamName][playerName].id,
          count,
        })),
      });
    }
  }

  await recalculateStandingsForGroups(prisma, ['المجموعة أ', 'المجموعة ب']);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('تمت تهيئة قاعدة البيانات بالبيانات التجريبية.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
