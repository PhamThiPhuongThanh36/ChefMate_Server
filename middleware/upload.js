const multer = require('multer');
const path = require('path');

// 1. ĐỊNH NGHĨA STORAGE ENGINE
const storage = multer.diskStorage({
    // Chỉ định thư mục lưu file
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    // Chỉ định tên file mới
    filename: function (req, file, cb) {
        // Lấy đuôi file gốc (ví dụ: .jpg, .png)
        const extension = path.extname(file.originalname);

        // Tạo tên file duy nhất: tên gốc (bỏ đuôi) + timestamp + đuôi
        const originalName = path.basename(file.originalname, extension);
        const uniqueSuffix = Date.now();

        // Tên file cuối cùng, ví dụ: "my-image-1678886400000.jpg"
        cb(null, originalName + '-' + uniqueSuffix + extension);
    }
});

// 2. SỬ DỤNG 'storage' THAY VÌ 'dest'
const upload = multer({
    storage: storage, // <-- THAY ĐỔI QUAN TRỌNG
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
}).single('image');

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