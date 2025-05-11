const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRouter = require('./routes/UserRouter');  // Import UserRouter
const photoRouter = require('./routes/PhotoRouter');  // Import PhotoRouter

const app = express();

app.use(express.json());
app.use(cors());  // Cho phép frontend truy cập backend

// Đăng ký các routes
app.use('/api', userRouter);  // Đảm bảo routes /user là /api/user trong frontend
app.use('/api', photoRouter);  // Đảm bảo routes /photos là /api/photos trong frontend

// Kiểm tra biến môi trường
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}
app.use('/', (req, res) => {
  res.send('Hello from the server!'); // Đổi thành /api để phù hợp với frontend
});
// Kết nối MongoDB và khởi động server
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(3000, () => console.log('Server running at http://localhost:3000')); // Đổi cổng thành 4000
  })
  .catch((err) => console.error('Database connection error:', err));

// Xử lý lỗi không mong muốn
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).send({ error: 'Something went wrong!' });
});