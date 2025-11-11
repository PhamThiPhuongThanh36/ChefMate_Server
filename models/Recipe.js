const { pool } = require('../config/db');

class Recipe {
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM Recipes');
        return rows;
    }

    static async searchByName(name) {
        const [rows] = await pool.query(
            'SELECT * FROM Recipes WHERE recipeName LIKE ?',
            [`%${name}%`]
        );
        return rows;
    }

    static async searchByTag(tagName) {
        const [rows] = await pool.query(
            `SELECT r.* FROM Recipes r
       JOIN RecipesTags rt ON r.recipeId = rt.recipeId
       JOIN Tags t ON rt.tagId = t.tagId
       WHERE t.tagName = ?`,
            [tagName]
        );
        return rows;
    }

    static async create(connection, { recipeName, image, isPublic, cookingTime, ration, userId }) {
        const [result] = await connection.query(
            `INSERT INTO Recipes (recipeName, image, isPublic, cookingTime, ration, likeQuantity, userId, viewCount)
             VALUES (?, ?, ?, ?, ?, 0, ?, 0)`,
            [recipeName, image, isPublic, cookingTime, ration, userId]
        );
        return result.insertId;
    }

    static async getByUser(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM Recipes WHERE userId = ?',
            [userId]
        );
        return rows;
    }

    static async getTrending() {
        const [rows] = await pool.query(
            'SELECT * FROM Recipes ORDER BY (viewCount + likeQuantity) DESC LIMIT 10'
        );
        return rows;
    }

    static async getAllIngredients() {
        const [rows] = await pool.query('SELECT * FROM Ingredients');
        return rows;
    }

    static async getAllTags() {
        const [rows] = await pool.query('SELECT * FROM Tags');
        return rows;
    }

    static async addTags(connection, recipeId, tags) {
        for (const tag of tags) {
            const tagName = typeof tag === 'string' ? tag : tag.tagName;
            if (!tagName) continue;

            let [rows] = await connection.query(
                'SELECT tagId FROM Tags WHERE tagName = ?',
                [tagName]
            );

            let tagId;
            if (rows.length > 0) {
                tagId = rows[0].tagId;
            } else {
                const [insertResult] = await connection.query(
                    'INSERT INTO Tags (tagName) VALUES (?)',
                    [tagName]
                );
                tagId = insertResult.insertId;
            }

            await connection.query(
                'INSERT INTO RecipesTags (recipeId, tagId) VALUES (?, ?)',
                [recipeId, tagId]
            );
        }
    }
    static async addIngredients(connection, recipeId, ingredients) {
        for (const ing of ingredients) {
            if (!ing.ingredientName || !ing.weight || !ing.unit) continue;

            let [rows] = await connection.query(
                'SELECT ingredientId FROM Ingredients WHERE ingredientName = ?',
                [ing.ingredientName]
            );

            let ingredientId;
            if (rows.length > 0) {
                ingredientId = rows[0].ingredientId;
            } else {
                const [insertResult] = await connection.query(
                    'INSERT INTO Ingredients (ingredientName) VALUES (?)',
                    [ing.ingredientName]
                );
                ingredientId = insertResult.insertId;
            }

            await connection.query(
                `INSERT INTO RecipesIngredients (recipeId, ingredientId, weight, unit)
                 VALUES (?, ?, ?, ?)`,
                [recipeId, ingredientId, parseInt(ing.weight) || 0, ing.unit]
            );
        }
    }

    static async addCookingSteps(connection, recipeId, steps) {
        for (let i = 0; i < steps.length; i++) {
            const content = steps[i].content || steps[i].description || '';
            if (!content) continue;

            await connection.query(
                `INSERT INTO CookingSteps (recipeId, indexStep, content)
                 VALUES (?, ?, ?)`,
                [recipeId, i + 1, content]
            );
        }
    }

    static async insertCollection(collectionData) {
        const { userId, recipeId } = collectionData
        await pool.query(
            'INSERT INTO UserSavedRecipes (userId, recipeId) VALUES (?, ?)',
            [userId, recipeId]
        );
    }

    static async getCollection(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM UserSavedRecipes WHERE userId = ?',
            [userId]
        )
        return [rows]
    }

    static async deleteCollectionById(collectionData) {
        const { userId, recipeId } = collectionData
        await pool.query(
            'DELETE FROM UserSavedRecipes WHERE userId = ? AND recipeId = ?',
            [userId, recipeId]
        )
    }

    static async getRecipeById(recipeId) {
        const [[recipe]] = await pool.query(
            `SELECT * FROM Recipes WHERE recipeId = ?`, [recipeId]
        );

        const [ingredients] = await pool.query(
            `
        SELECT i.ingredientName, ri.weight, ri.unit
        FROM RecipesIngredients AS ri
        JOIN Ingredients AS i ON ri.ingredientId = i.ingredientId
        WHERE ri.recipeId = ?
        `,
            [recipeId]
        );

        const [steps] = await pool.query(
            `
        SELECT indexStep, content
        FROM CookingSteps
        WHERE recipeId = ?
        ORDER BY indexStep ASC
        `,
            [recipeId]
        );

        const [userRows] = await pool.query(
            `
        SELECT u.userId, u.fullName, u.image
        FROM Users AS u
        JOIN Recipes AS r ON u.userId = r.userId
        Where r.recipeId = ?
            `,
            [recipeId]
        );
        const user = userRows.length > 0 ? userRows[0] : null;
        recipe.ingredients = ingredients;
        recipe.steps = steps;
        recipe.user = user;

        return recipe;
    }
}

module.exports = Recipe;