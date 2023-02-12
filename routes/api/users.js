const express = require("express");
const router = express.Router();
const {
  passwordJoiSchema,
  loginJoiSchema,
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
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
