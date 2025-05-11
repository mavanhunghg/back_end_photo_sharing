const express = require('express');
const mongoose = require('mongoose');
const Photo = require('../db/photoModel'); // Đảm bảo bạn đã import đúng model Photo
const User = require('../db/userModel'); // Đảm bảo bạn đã import đúng model User

const router = express.Router(); // Khởi tạo router

// /photosOfUser/:id - Return all photos of a user with comments and user info
router.get('/photosOfUser/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).send({ error: 'Invalid user ID format' });
  }

  try {
    const photos = await Photo.find({ user_id: req.params.id });
    console.log('Fetched photos:', photos); // Ghi log dữ liệu

    const result = await Promise.all(
      photos.map(async (photo) => {
        const commentsWithUser = await Promise.all(
          photo.comments.map(async (comment) => {
            const user = await User.findById(comment.user_id, '_id first_name last_name');
            return {
              _id: comment._id,
              comment: comment.comment,
              date_time: comment.date_time,
              user,
            };
          })
        );

        return {
          _id: photo._id,
          user_id: photo.user_id,
          file_name: photo.file_name,
          date_time: photo.date_time,
          comments: commentsWithUser,
        };
      })
    );

    console.log('Processed photos with comments:', result); // Ghi log dữ liệu đã xử lý
    res.json(result);
  } catch (err) {
    console.error('Error fetching photos or comments:', err); // Ghi log lỗi
    res.status(500).send({ error: 'Error fetching photos or comments' });
  }
});

module.exports = router; 