const express = require('express');
const {
  renderHomePage,
  renderGroupsPage,
  renderMatchesPage,
  renderKnockoutsPage,
  renderScorersPage,
  renderTeamPage,
} = require('../controllers/publicController');

const router = express.Router();

router.get('/', renderHomePage);
router.get('/groups', renderGroupsPage);
router.get('/matches', renderMatchesPage);
router.get('/knockouts', renderKnockoutsPage);
router.get('/scorers', renderScorersPage);
router.get('/teams/:id', renderTeamPage);

module.exports = router;
