const mongoose = require("mongoose");
require("dotenv").config();

const models = require("../modelData/models.js");

const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect("mongodb+srv://server:server@cluster.mqkan0y.mongodb.net/photo-sharing");
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas!", error);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  }

  await User.deleteMany({});
  await Photo.deleteMany({});
  await SchemaInfo.deleteMany({});

  const userModels = models.userListModel();
  const mapFakeId2RealId = {};
  for (const user of userModels) {
    const userObj = new User({
      first_name: user.first_name, // Sửa lại thành first_name
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
    });
    try {
      await userObj.save();
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log(
        "Adding user:",
        user.first_name + " " + user.last_name,
        " with ID ",
        user.objectID,
      );
    } catch (error) {
      console.error("Error creating user", error);
    }
  }

  const photoModels = [];
  const userIDs = Object.keys(mapFakeId2RealId);
  userIDs.forEach(function (id) {
    photoModels.push(...models.photoOfUserModel(id));
  });
  for (const photo of photoModels) {
    const photoObj = await Photo.create({
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: mapFakeId2RealId[photo.user_id],
    });
    photo.objectID = photoObj._id;
    if (photo.comments) {
      photo.comments.forEach(function (comment) {
        photoObj.comments = photoObj.comments.concat([
          {
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: comment.user.objectID,
          },
        ]);
        console.log(
          "Adding comment of length %d by user %s to photo %s",
          comment.comment.length,
          comment.user.objectID,
          photo.file_name,
        );
      });
    }
    try {
      await photoObj.save();
      console.log(
        "Adding photo:",
        photo.file_name,
        " of user ID ",
        photoObj.user_id,
      );
    } catch (error) {
      console.error("Error creating photo", error);
    }
  }

  try {
    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo object created with version ", schemaInfo.version);
  } catch (error) {
    console.error("Error creating schemaInfo", error);
  }

  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error disconnecting from MongoDB", error);
  }
}

dbLoad();