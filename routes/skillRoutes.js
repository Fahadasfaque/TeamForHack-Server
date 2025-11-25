const express = require('express');
const router = express.Router();
const { getUserSkills } = require('../controllers/skillXPController');

router.get('/:userId', getUserSkills);

module.exports = router;
