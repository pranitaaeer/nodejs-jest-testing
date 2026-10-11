const express = require("express");
const {
  signup,
  login,
  userDetails,
  followUser,
  updateProfile,
  searchUser,
  logout,
  myInfo,
} = require("../controllers/user.controllers");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/user/:id", auth, userDetails);
router.put("/user/follow/:id", auth, followUser);
router.put("/update", auth, updateProfile);
router.get("/users/search/:query", auth, searchUser);
router.post("/logout", auth, logout);
router.get("/me", auth, myInfo);

module.exports = router;