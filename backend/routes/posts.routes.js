const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const postsController = require('../controllers/posts.controller');

// Public routes (authenticated users see published + drafts for admin)
router.get('/', postsController.listPosts);
router.get('/:id', postsController.getPost);
router.post('/', [auth, admin], postsController.createPost);
router.put('/:id', [auth, admin], postsController.updatePost);
router.delete('/:id', [auth, admin], postsController.deletePost);

module.exports = router;
