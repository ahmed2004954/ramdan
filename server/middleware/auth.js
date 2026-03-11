function ensureAdmin(req, res, next) {
  if (!req.session.adminUser) {
    req.flash('error', 'يجب تسجيل الدخول أولًا للوصول إلى لوحة الإدارة.');
    return res.redirect('/admin/login');
  }

  return next();
}

module.exports = {
  ensureAdmin,
};
