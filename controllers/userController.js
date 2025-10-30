const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const user = await User.register(req.body);
        res.status(201).json({ message: 'Đăng ký thành công', data: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User.login(identifier, password);
        if (!user) return res.status(401).json({ error: 'Sai thông tin đăng nhập' });
        res.json({ message: 'Đăng nhập thành công', data: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        await User.changePassword(userId, newPassword);
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        await User.updateProfile(userId, req.body);
        res.json({ message: 'Cập nhật thông tin thành công' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};