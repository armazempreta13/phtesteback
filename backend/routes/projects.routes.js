const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const projectsController = require('../controllers/projects.controller');

router.get('/', auth, projectsController.listProjects);
router.get('/:id', auth, projectsController.getProject);
router.post('/', [auth, admin], projectsController.createProject);
router.put('/:id', [auth, admin], projectsController.updateProject);
router.delete('/:id', [auth, admin], projectsController.deleteProject);

module.exports = router;
