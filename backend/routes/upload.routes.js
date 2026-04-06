const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/upload.controller');

router.post('/', auth, upload.single('file'), uploadController.uploadFile);
router.get('/:filename', auth, uploadController.downloadFile);
router.get('/', auth, uploadController.listUploads);

module.exports = router;
