const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const portfolioController = require('../controllers/portfolio.controller');

// Public routes
router.get('/', portfolioController.listPortfolio);
router.get('/:id', portfolioController.getPortfolioItem);
router.post('/', [auth, admin], portfolioController.createPortfolioItem);
router.put('/:id', [auth, admin], portfolioController.updatePortfolioItem);
router.delete('/:id', [auth, admin], portfolioController.deletePortfolioItem);

module.exports = router;
