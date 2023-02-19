const Jimp = require("jimp");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { Conflict } = require("http-errors");
const { SECRET_KEY } = process.env;
const { User } = require("../models/users");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      throw new Conflict(409, "Email in use");
    }
    const url = gravatar.url(email, {
      protocol: "http",
      s: "250",
    });

    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
      avatarURL: url,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json({ message: "Logout success" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ massege: "Email or password is wrong" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ massege: "Email or password is wrong" });
    }

    const payload = {
      id: user._id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "10h" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      user: {
        email: email,
        subscription: "starter",
      },
      token: token,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { name, email, subscription } = req.user;
    res.json({
      name,
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

const transformAvatar = async (path) => {
  const updateImg = await Jimp.read(path);
  await updateImg
    .autocrop()
    .contain(
      250,
      250,
      Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE
    )
    .writeAsync(path);
};

const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new NotFound(400, "Bad Request. Please add your avatar image.");
    }
    const { path: tempUpload, filename } = req.file;
    const { _id } = req.user;
    const [extention] = filename.split(".").reverse();

    const newFileName = `${_id}.${extention}`;

    transformAvatar(tempUpload);

    const resultUpload = path.join(avatarsDir, newFileName);

    await fs.rename(tempUpload, resultUpload);

    // const avatarURL = path.join("avatars", newFileName);

    const avatarURL = `http://localhost:3000/avatars/${newFileName}`;

    await User.findByIdAndUpdate(_id, { avatarURL });

    res.json({
      avatarURL,
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.tempUpload);
    }
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateAvatar,
};
