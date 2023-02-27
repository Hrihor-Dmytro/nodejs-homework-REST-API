const Jimp = require("jimp");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs/promises");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { Conflict, BadRequest } = require("http-errors");

const { SECRET_KEY, SENDGRID_API_KEY, PORT } = process.env;

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(SENDGRID_API_KEY);

const { User } = require("../models/users");
const { v4: uuidv4 } = require("uuid");

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
    const verificationToken = uuidv4();

    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
      avatarURL: url,
      verificationToken,
    });

    await newUser.save();

    const msg = {
      to: email,
      from: "grigor_dy@ukr.net", // Use the email address or domain you verified above
      subject: "Thanks for your registration",
      text: "Welcome to our service",
      html: `<a target="_blank" href="http://localhost:${PORT}/api/users/verify/${verificationToken}">Нажмите для подтверждения email</a>`,
    };
    await sgMail.send(msg).then(
      () => {},
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );

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
    const avatarURL = `http://localhost:${PORT}/avatars/${newFileName}`;
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

const emailChecking = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw NotFound();
  }
  await User.findByIdAndUpdate(user._id, {
    veryfy: true,
    verificationToken: null,
  });
  res.json({
    massege: "Verification successful",
  });
};

const resendEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user.verify) {
    throw new BadRequest("Verification has already been passed");
  }
  const { verificationToken } = user;

  const msg = {
    to: email,
    from: EMAIL_SENDER, // Use the email address or domain you verified above
    subject: "Thanks for your registration",
    text: "Welcome to our service",
    html: `<a target="_blank" href="http://localhost:${PORT}/api/users/verify/${verificationToken}">Нажмите для подтверждения email</a>`,
  };

  await sgMail.send(msg);

  res.status(200).json({
    message: "Verification email sent",
  });
};

module.exports = {
  signup,
  login,
  logout,
  getCurrent,
  updateAvatar,
  emailChecking,
  resendEmail,
};
