function attachFlash(req, res, next) {
  req.flash = (type, message) => {
    req.session.flash = { type, message };
  };

  next();
}

function consumeFlash(req, res, next) {
  res.locals.flash = req.session.flash || null;
  delete req.session.flash;
  next();
}

module.exports = {
  attachFlash,
  consumeFlash,
};
