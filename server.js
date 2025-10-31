const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { connectDB } = require('./config/db');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.get('/', (req, res) => {
    res.json({ message: 'ChefMate Server MySQL đang chạy!' });
});

app.use('/api', routes);
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server đang chạy tại http://localhost:${port}`);
    });
});