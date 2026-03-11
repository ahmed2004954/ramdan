const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

function renderLoginPage(req, res) {
  if (req.session.adminUser) {
    return res.redirect('/admin');
  }

  return res.render('admin/login', {
    title: 'تسجيل الدخول',
    layout: 'layouts/main',
    hidePublicNavigation: true,
  });
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const admin = await prisma.adminUser.findUnique({
      where: {
        username,
      },
    });

    if (!admin) {
      req.flash('error', 'بيانات الدخول غير صحيحة.');
      return res.redirect('/admin/login');
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isValid) {
      req.flash('error', 'بيانات الدخول غير صحيحة.');
      return res.redirect('/admin/login');
    }

    req.session.adminUser = {
      id: admin.id,
      username: admin.username,
    };

    req.flash('success', 'تم تسجيل الدخول بنجاح.');
    return res.redirect('/admin');
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  req.session = null;
  res.redirect('/admin/login');
}

module.exports = {
  renderLoginPage,
  login,
  logout,
};
