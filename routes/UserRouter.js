const express = require('express');
const mongoose = require('mongoose');
const User = require('../db/userModel');

const router = express.Router();

// /admin/login - Đăng nhập
router.post('/admin/login', async (req, res) => {
  console.log(req.body)
  const { login_name, password } = req.body;
  if (!login_name || !password) {
    return res.status(400).json({ error: "Thiếu thông tin đăng nhập" });
  }
  const user = await User.findOne({ login_name });
  if (!user || user.password !== password) {
    return res.status(400).json({ error: "Sai login_name hoặc password" });
  }
  req.session.userId = user._id;
  res.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name, login_name: user.login_name });
});

// /admin/logout - Đăng xuất
router.post('/admin/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.send({ message: "Đã đăng xuất" });
    });
  } else {
    res.status(400).json({ error: "Chưa đăng nhập" });
  }
});

// /user/list - Lấy danh sách user
router.get('/user/list', async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name');
    res.json(users);
  } catch (err) {
    res.status(500).send({ error: 'Unable to fetch user list' });
  }
});

// /user/:id - Lấy thông tin chi tiết user
router.get('/user/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ error: 'Invalid user ID format' });
  }
  try {
    const user = await User.findById(req.params.id, '_id first_name last_name location description occupation');
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send({ error: 'Server error while fetching user' });
  }
});

// /user - Đăng ký user mới
router.post('/user', async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body;
  if (!login_name || !password || !first_name || !last_name) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
  }
  const existed = await User.findOne({ login_name });
  if (existed) {
    return res.status(400).json({ error: "login_name đã tồn tại" });
  }
  const user = new User({ login_name, password, first_name, last_name, location, description, occupation });
  await user.save();
  res.json({ login_name: user.login_name, first_name: user.first_name });
});

module.exports = router;