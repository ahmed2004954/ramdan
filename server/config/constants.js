const navigationItems = [
  { href: '/', label: 'الرئيسية' },
  { href: '/groups', label: 'المجموعات' },
  { href: '/matches', label: 'المباريات' },
  { href: '/knockouts', label: 'الأدوار الإقصائية' },
  { href: '/scorers', label: 'الهدافون' },
];

const adminNavigationItems = [
  { href: '/admin', label: 'لوحة التحكم' },
  { href: '/admin/teams', label: 'الفرق' },
  { href: '/admin/players', label: 'اللاعبون' },
  { href: '/admin/matches', label: 'المباريات' },
];

const matchStatusClasses = {
  UPCOMING: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  LIVE: 'bg-amber-100 text-amber-900 ring-amber-200',
  FINISHED: 'bg-slate-100 text-slate-800 ring-slate-200',
};

const matchStatusLabels = {
  UPCOMING: 'قادمة',
  LIVE: 'مباشرة',
  FINISHED: 'انتهت',
};

const stageLabels = {
  GROUP: 'دور المجموعات',
  R16: 'دور الـ16',
  QF: 'ربع النهائي',
  SF: 'نصف النهائي',
  FINAL: 'النهائي',
};

const matchFilters = [
  { value: 'all', label: 'الكل' },
  { value: 'today', label: 'اليوم' },
  { value: 'tomorrow', label: 'غدًا' },
  { value: 'week', label: 'هذا الأسبوع' },
];

const groupNames = ['المجموعة أ', 'المجموعة ب'];

module.exports = {
  navigationItems,
  adminNavigationItems,
  matchStatusClasses,
  matchStatusLabels,
  stageLabels,
  matchFilters,
  groupNames,
};
