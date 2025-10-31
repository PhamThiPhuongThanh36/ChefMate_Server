const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { upload, handleMulterError } = require('../middleware/upload');

router.get('/', recipeController.getAll);
router.get('/search', recipeController.searchByName);
router.get('/tags/:tag', recipeController.searchByTag);
router.get('/user/:userId', recipeController.getByUser);
router.get('/trending', recipeController.getTrending);
router.get('/ingredients', recipeController.getAllIngredients);
router.get('/tags', recipeController.getAllTags);
router.get('insertCollection', recipeController.insertCollection);
router.get('/recipe', recipeController.getRecipeById);

router.post('/getcollection', recipeController.getCollection);
router.post('/create', upload, handleMulterError, recipeController.create);

module.exports = router;