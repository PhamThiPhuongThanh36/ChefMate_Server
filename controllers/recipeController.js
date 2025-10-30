const { connectDB } = require('../config/db');
const Recipe = require('../models/Recipe');
const { pool } = require('../config/db');

exports.getAll = async (req, res) => {
    try {
        const recipes = await Recipe.getAll();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchByName = async (req, res) => {
    try {
        const { name } = req.query;
        const recipes = await Recipe.searchByName(name);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.searchByTag = async (req, res) => {
    try {
        const { tag } = req.params;
        const recipes = await Recipe.searchByTag(tag);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = [
    async (req, res) => {
        let connection = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            console.log("Body:", req.body);
            console.log("File:", req.file ? req.file.filename : "No file");

            const {
                recipeName,
                cookingTime,
                ration,
                userId: userIdStr,
                ingredients: ingredientsRaw,
                cookingSteps: cookingStepsRaw,
                tags: tagsRaw = []
            } = req.body;

            const image = req.file ? `/uploads/${req.file.filename}` : '';

            if (!recipeName || !cookingTime || !ration || !userIdStr) {
                throw new Error('Thiếu thông tin bắt buộc');
            }

            const userId = parseInt(userIdStr);
            if (isNaN(userId)) throw new Error('userId không hợp lệ');

            const [userRows] = await connection.query(
                'SELECT userId FROM Users WHERE userId = ?',
                [userId]
            );
            if (userRows.length === 0) {
                throw new Error(`Không tìm thấy user với userId = ${userId}`);
            }

            // === PARSE JSON ===
            let ingredientList = [];
            let stepList = [];

            try {
                ingredientList = ingredientsRaw ? JSON.parse(ingredientsRaw) : [];
            } catch (e) {
                throw new Error('ingredients không hợp lệ');
            }

            try {
                stepList = cookingStepsRaw ? JSON.parse(cookingStepsRaw) : [];
            } catch (e) {
                throw new Error('cookingSteps không hợp lệ');
            }

            const recipeId = await Recipe.create(connection, {
                recipeName,
                image,
                cookingTime,
                ration: parseInt(ration),
                userId
            });

            if (ingredientList.length > 0) {
                await Recipe.addIngredients(connection, recipeId, ingredientList);
            }
            if (stepList.length > 0) {
                await Recipe.addCookingSteps(connection, recipeId, stepList);
            }
            if (tagsRaw.length > 0) {
                const tagsArray = Array.isArray(tagsRaw) ? tagsRaw : [tagsRaw];
                await Recipe.addTags(connection, recipeId, tagsArray);
            }

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Tạo công thức thành công',
                recipeId
            });

        } catch (err) {
            if (connection) await connection.rollback();
            console.error('Lỗi:', err.message);
            res.status(500).json({
                success: false,
                error: 'Không thể tạo công thức',
                details: err.message
            });
        } finally {
            if (connection) connection.release();
        }
    }
];

exports.getByUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const recipes = await Recipe.getByUser(userId);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getTrending = async (req, res) => {
    try {
        const recipes = await Recipe.getTrending();
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllIngredients = async (req, res) => {
    try {
        const ingredients = await Recipe.getAllIngredients();
        res.json(ingredients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllTags = async (req, res) => {
    try {
        const tags = await Recipe.getAllTags();
        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};