const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { upload, handleMulterError } = require('../middleware/upload');

router.get('/', recipeController.getAll);
router.get('/search', recipeController.searchByName); // ?name=query
router.get('/tags/:tag', recipeController.searchByTag);
router.get('/user/:userId', recipeController.getByUser);
router.get('/trending', recipeController.getTrending);
router.get('/ingredients', recipeController.getAllIngredients);
router.get('/tags', recipeController.getAllTags);

router.post('/create', upload, handleMulterError, recipeController.create);

module.exports = router;