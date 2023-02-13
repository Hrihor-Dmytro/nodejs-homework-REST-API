const express = require("express");
const router = express.Router();
const {
  passwordJoiValidation,
  loginJoiValidation,
} = require("../../validate/validate");
const auth = require("../../middlewares/auth");
const {
  signup,
  logout,
  login,
  getCurrent,
} = require("../../controllers/users");

router.get("/current", auth, getCurrent);
router.get("/logout", auth, logout);
router.post("/signup", passwordJoiValidation, signup);
router.post("/login", loginJoiValidation, login);

module.exports = router;
