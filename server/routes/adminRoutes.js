const express = require('express');
const { ensureAdmin } = require('../middleware/auth');
const { renderLoginPage, login, logout } = require('../controllers/adminAuthController');
const { renderDashboard } = require('../controllers/adminDashboardController');
const {
  renderTeamsIndex,
  redirectToTeamPlayersPage,
  renderTeamDetailsPage,
  renderNewTeamPage,
  createTeam,
  createTeamPlayer,
  renderEditTeamPage,
  updateTeam,
  deleteTeamPlayer,
  deleteTeam,
} = require('../controllers/adminTeamController');
const {
  renderPlayersIndex,
  createPlayer,
  updatePlayer,
  deletePlayer,
} = require('../controllers/adminPlayerController');
const {
  renderMatchesIndex,
  renderNewMatchPage,
  createMatchAction,
  renderEditMatchPage,
  updateMatchAction,
  updateGoalsAction,
  deleteMatchAction,
} = require('../controllers/adminMatchController');

const router = express.Router();

router.get('/admin/login', renderLoginPage);
router.post('/admin/login', login);
router.post('/admin/logout', ensureAdmin, logout);

router.get('/admin', ensureAdmin, renderDashboard);

router.get('/admin/teams', ensureAdmin, renderTeamsIndex);
router.get('/admin/teams/new', ensureAdmin, renderNewTeamPage);
router.post('/admin/teams', ensureAdmin, createTeam);
router.get('/admin/teams/:id', ensureAdmin, redirectToTeamPlayersPage);
router.get('/admin/teams/:id/players', ensureAdmin, renderTeamDetailsPage);
router.post('/admin/teams/:id/players', ensureAdmin, createTeamPlayer);
router.post('/admin/teams/:id/players/:playerId/delete', ensureAdmin, deleteTeamPlayer);
router.get('/admin/teams/:id/edit', ensureAdmin, renderEditTeamPage);
router.post('/admin/teams/:id', ensureAdmin, updateTeam);
router.post('/admin/teams/:id/delete', ensureAdmin, deleteTeam);

router.get('/admin/players', ensureAdmin, renderPlayersIndex);
router.post('/admin/players', ensureAdmin, createPlayer);
router.post('/admin/players/:id', ensureAdmin, updatePlayer);
router.post('/admin/players/:id/delete', ensureAdmin, deletePlayer);

router.get('/admin/matches', ensureAdmin, renderMatchesIndex);
router.get('/admin/matches/new', ensureAdmin, renderNewMatchPage);
router.post('/admin/matches', ensureAdmin, createMatchAction);
router.get('/admin/matches/:id/edit', ensureAdmin, renderEditMatchPage);
router.post('/admin/matches/:id', ensureAdmin, updateMatchAction);
router.post('/admin/matches/:id/goals', ensureAdmin, updateGoalsAction);
router.post('/admin/matches/:id/delete', ensureAdmin, deleteMatchAction);

module.exports = router;
