const mongoose = require("mongoose");

const modelsShema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email must be exist"],
    },
    phone: {
      type: String,
      unique: true,
      required: [true, "Phone must be exist"],
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const Contact = mongoose.model("contacts", modelsShema);

module.exports = { Contact };
