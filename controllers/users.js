const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/users");
const { SECRET_KEY } = process.env;
const { Conflict } = require("http-errors");

const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      // res.status(409).json({ message: "Email in use" });
      throw new Conflict(409, "Email in use");
    }

    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
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

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
};
