const express = require('express');
const mongoose = require('mongoose');
const User = require('../db/userModel'); // Đảm bảo bạn đã import đúng model User

const router = express.Router(); // Khởi tạo router

// /user/list - Return a list of users with basic information
router.get('/user/list', async (req, res) => {
  try {
    const users = await User.find({}, '_id first_name last_name');
    console.log('Fetched users:', users); // Ghi log dữ liệu
    res.json(users);
  } catch (err) {
    console.error('Error fetching user list:', err); // Ghi log lỗi
    res.status(500).send({ error: 'Unable to fetch user list' });
  }
});

// /user/:id - Return detailed information about a user
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
    console.error('Error fetching user:', err); // Ghi log lỗi
    res.status(500).send({ error: 'Server error while fetching user' });
  }
});

module.exports = router;