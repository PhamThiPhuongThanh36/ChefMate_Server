// middleware/upload.js
const multer = require('multer');
const path = require('path');

const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024,
        fieldSize: 10 * 1024 * 1024,
        fields: 20,
        parts: 30
    },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) return cb(null, true);
        cb(new Error('Chỉ cho phép ảnh JPEG/PNG/GIF'));
    }
}).single('image'); // Đính kèm ảnh vào req.file, còn lại: req.body

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer Error:", err.code, err.message);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err) {
        console.error("Upload Error:", err.message);
        return res.status(400).json({ error: err.message });
    }
    next();
};

module.exports = { upload, handleMulterError };