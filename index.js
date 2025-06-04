const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const userRouter = require('./routes/UserRouter');
const photoRouter = require('./routes/PhotoRouter');

const app = express();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:3001", // sửa lại nếu frontend chạy port khác
  credentials: true
}));

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use('/api', userRouter);
app.use('/api', photoRouter);

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in .env file');
  process.exit(1);
}

app.get('/', (req, res) => {
  res.send('Hello from the server!');
});

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
  })
  .catch((err) => console.error('Database connection error:', err));

app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).send({ error: 'Something went wrong!' });
});