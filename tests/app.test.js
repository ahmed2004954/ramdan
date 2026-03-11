const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.DATABASE_URL = 'file:./test.db';
process.env.SESSION_SECRET = 'test-secret';

const app = require('../server/app');
const prisma = require('../server/config/prisma');

test.after(async () => {
  await prisma.$disconnect();
});

test('الصفحة الرئيسية تعمل', async () => {
  const response = await request(app).get('/');

  assert.equal(response.statusCode, 200);
  assert.match(response.text, /دوري رمضان لكرة القدم/);
});

test('لوحة الإدارة محمية قبل تسجيل الدخول', async () => {
  const response = await request(app).get('/admin');

  assert.equal(response.statusCode, 302);
  assert.equal(response.headers.location, '/admin/login');
});

test('تسجيل الدخول يسمح بالوصول إلى لوحة الإدارة', async () => {
  const agent = request.agent(app);

  const loginResponse = await agent.post('/admin/login').type('form').send({
    username: 'admin',
    password: 'ramadan2026',
  });

  assert.equal(loginResponse.statusCode, 302);
  assert.equal(loginResponse.headers.location, '/admin');

  const dashboardResponse = await agent.get('/admin');
  assert.equal(dashboardResponse.statusCode, 200);
  assert.match(dashboardResponse.text, /لوحة التحكم/);
});

test('صفحة الفريق داخل الإدارة تعرض لاعبي الفريق', async () => {
  const agent = request.agent(app);

  await agent.post('/admin/login').type('form').send({
    username: 'admin',
    password: 'ramadan2026',
  });

  const response = await agent.get('/admin/teams/1/players');

  assert.equal(response.statusCode, 200);
  assert.match(response.text, /إدارة الفريق/);
  assert.match(response.text, /أحمد سامي/);
});

test('حفظ هدافي المباراة يعرض رسالة واضحة عند عدم تطابق الأهداف مع النتيجة', async () => {
  const agent = request.agent(app);

  await agent.post('/admin/login').type('form').send({
    username: 'admin',
    password: 'ramadan2026',
  });

  const response = await agent
    .post('/admin/matches/1/goals')
    .type('form')
    .send({
      playerId: ['1', '3', '6', '7'],
      teamId: ['1', '1', '2', '2'],
      count: ['1', '0', '0', '0'],
    })
    .redirects(1);

  assert.equal(response.statusCode, 200);
  assert.match(response.text, /مجموع أهداف اللاعبين يجب أن يطابق نتيجة المباراة/);
});

test('الترتيب محسوب بعد بيانات seed', async () => {
  const firstStanding = await prisma.standing.findFirst({
    where: {
      groupName: 'المجموعة أ',
    },
    orderBy: [{ points: 'desc' }, { goalsFor: 'desc' }],
    include: {
      team: true,
    },
  });

  assert.equal(firstStanding.team.name, 'الصقور');
  assert.equal(firstStanding.points, 6);
});

test('الهداف الأول موجود بعد بيانات seed', async () => {
  const grouped = await prisma.goal.groupBy({
    by: ['playerId'],
    _sum: {
      count: true,
    },
    orderBy: {
      _sum: {
        count: 'desc',
      },
    },
    take: 1,
  });

  const player = await prisma.player.findUnique({
    where: {
      id: grouped[0].playerId,
    },
  });

  assert.equal(player.name, 'حاتم أسامة');
  assert.equal(grouped[0]._sum.count, 4);
});
