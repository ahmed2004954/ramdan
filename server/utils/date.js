const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
const isBetween = require('dayjs/plugin/isBetween');
require('dayjs/locale/ar');

dayjs.extend(localizedFormat);
dayjs.extend(isBetween);
dayjs.locale('ar');

function formatDateArabic(value) {
  return dayjs(value).format('D MMMM YYYY');
}

function formatTimeArabic(value) {
  return dayjs(value).format('hh:mm A');
}

function formatDateTimeArabic(value) {
  return `${formatDateArabic(value)} - ${formatTimeArabic(value)}`;
}

function getFilterRange(filter) {
  const now = dayjs();

  if (filter === 'today') {
    return {
      start: now.startOf('day').toDate(),
      end: now.endOf('day').toDate(),
    };
  }

  if (filter === 'tomorrow') {
    const tomorrow = now.add(1, 'day');
    return {
      start: tomorrow.startOf('day').toDate(),
      end: tomorrow.endOf('day').toDate(),
    };
  }

  if (filter === 'week') {
    return {
      start: now.startOf('day').toDate(),
      end: now.add(6, 'day').endOf('day').toDate(),
    };
  }

  return null;
}

module.exports = {
  dayjs,
  formatDateArabic,
  formatTimeArabic,
  formatDateTimeArabic,
  getFilterRange,
};
