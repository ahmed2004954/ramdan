const { loadEnvIfExists } = require('./utils/loadEnv');

loadEnvIfExists();

const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const expressLayouts = require('express-ejs-layouts');

const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { attachFlash, consumeFlash } = require('./middleware/flash');
const {
  navigationItems,
  adminNavigationItems,
  matchStatusClasses,
  matchStatusLabels,
  stageLabels,
  matchFilters,
} = require('./config/constants');
const { formatDateArabic, formatTimeArabic, formatDateTimeArabic } = require('./utils/date');

const app = express();

// Vercel sits behind a proxy, and secure cookies need the forwarded protocol.
app.set('trust proxy', 1);

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.set('layout', 'layouts/main');

app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cookieSession({
    name: 'ramadan_league_session',
    secret: process.env.SESSION_SECRET || 'ramadan-league-secret',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8,
  }),
);

app.use(attachFlash);
app.use(consumeFlash);
app.use(express.static(path.join(process.cwd(), 'public')));

app.locals.navigationItems = navigationItems;
app.locals.adminNavigationItems = adminNavigationItems;
app.locals.matchStatusClasses = matchStatusClasses;
app.locals.matchStatusLabels = matchStatusLabels;
app.locals.stageLabels = stageLabels;
app.locals.matchFilters = matchFilters;
app.locals.formatDateArabic = formatDateArabic;
app.locals.formatTimeArabic = formatTimeArabic;
app.locals.formatDateTimeArabic = formatDateTimeArabic;
app.locals.isActivePath = (currentPath, target) => {
  if (target === '/') {
    return currentPath === target;
  }

  return currentPath.startsWith(target);
};

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.currentAdminPath = req.path;
  res.locals.adminUser = req.session.adminUser || null;
  res.locals.hidePublicNavigation = false;
  next();
});

app.use(publicRoutes);
app.use(adminRoutes);

app.use((req, res) => {
  res.status(404).render('pages/not-found', {
    title: 'الصفحة غير موجودة',
    layout: 'layouts/main',
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).render('pages/error', {
    title: 'حدث خطأ',
    layout: 'layouts/main',
    errorMessage: 'حدث خطأ غير متوقع. حاول مرة أخرى.',
  });
});

module.exports = app;
