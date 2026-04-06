const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const contractController = require('../controllers/contract.controller');

// Anyone authenticated can view their contract
router.get('/:project_id', auth, contractController.getContract);

// Admin-only: generate, update, revoke
router.post('/generate', [auth, admin], contractController.generateContract);
router.patch('/:project_id', [auth, admin], contractController.updateContract);
router.delete('/:project_id/revoke', [auth, admin], contractController.revokeContract);

module.exports = router;
