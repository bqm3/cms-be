const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const userRoutes = require('./routes/userRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();

var corsOptions = {
  origin: [
    "*",
    "http://localhost:3000",
    "http://172.21.160.1:5173",
    "http://192.168.1.19:5173",
    "http://localhost:5173",
    "https://globalpromotionllc.com"
  ],

  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cookieParser()); 
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('CMS API is running...');
});

module.exports = app;
