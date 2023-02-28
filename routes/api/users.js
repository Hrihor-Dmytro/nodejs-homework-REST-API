const express = require("express");
const router = express.Router();
const {
  passwordJoiValidation,
  loginJoiValidation,
} = require("../../validate/validate");

const auth = require("../../middlewares/auth");
const upload = require("../../middlewares/upload");

const {
  signup,
  logout,
  login,
  getCurrent,
  updateAvatar,
  emailChecking,
} = require("../../controllers/users");

router.get("/current", auth, getCurrent);
router.get("/logout", auth, logout);
router.post("/signup", passwordJoiValidation, signup);
router.post("/login", loginJoiValidation, login);
router.patch("/avatars", auth, upload.single("avatar"), updateAvatar);
router.get("/verify/:verificationToken", emailChecking);

module.exports = router;
