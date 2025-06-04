const express = require('express');
const mongoose = require('mongoose');
const Photo = require('../db/photoModel'); // Đảm bảo bạn đã import đúng model Photo
const User = require('../db/userModel'); // Đảm bảo bạn đã import đúng model User
const multer = require('multer');
const path = require('path');

const router = express.Router(); // Khởi tạo router

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../images'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

router.post('/photos/new', upload.single('photo'), async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: "Chưa đăng nhập" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: userId,
      comments: []
    });
    await newPhoto.save();
    res.status(201).json({ message: "Đã upload ảnh", photo: newPhoto });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi upload ảnh" });
  }
});

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
// Thêm comment cho một ảnh
router.post('/commentsOfPhoto/:photoId', async (req, res) => {
  const { comment } = req.body;
  const photoId = req.params.photoId;
  const userId = req.session.userId; // hoặc lấy từ JWT nếu dùng token

  if (!comment || !userId) {
    return res.status(400).json({ error: "Thiếu nội dung comment hoặc chưa đăng nhập" });
  }

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ error: "Không tìm thấy ảnh" });
    }

    const newComment = {
      comment,
      date_time: new Date(),
      user_id: userId,
      _id: new mongoose.Types.ObjectId()
    };

    photo.comments.push(newComment);
    await photo.save();

    res.status(201).json({ message: "Đã thêm comment", comment: newComment });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi thêm comment" });
  }
});



module.exports = router; 