const express = require('express');
const router = express.Router();

router.use('/users', require('./userRoutes'));
router.use('/recipes', require('./recipeRoutes'));

module.exports = router;