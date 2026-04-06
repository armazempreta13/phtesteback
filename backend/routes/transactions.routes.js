const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const transactionsController = require('../controllers/transactions.controller');

// Webhook signature verification middleware
function verifyWebhookSignature(req, res, next) {
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const signature = req.header('X-Webhook-Secret');

  if (!webhookSecret) {
    return res.status(500).json({
      success: false,
      message: 'Webhook not configured',
    });
  }

  if (!signature || signature !== webhookSecret) {
    return res.status(401).json({
      success: false,
      message: 'Webhook signature invalid or missing',
    });
  }

  next();
}

router.get('/', auth, transactionsController.listTransactions);
router.get('/:id', auth, transactionsController.getTransaction);
router.post('/', auth, transactionsController.createTransaction);
router.post('/:id/webhook', verifyWebhookSignature, transactionsController.webhookPayment);

module.exports = router;
