const { Contact } = require("../models/modelsShema");

const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
};

const getContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findById(contactId);
    if (!result) {
      return res.status(400).json({
        message: `Contact with id=${contactId} not found`,
      });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

const addContact = async (req, res, next) => {
  try {
    const result = await Contact.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await Contact.findByIdAndRemove(contactId);

    if (!result) {
      return res.status(400).json({
        message: `Contact with id=${contactId} not found`,
      });
    }
    res.json({
      message: "Your contact deleted",
    });
  } catch (error) {
    next(error);
  }
};

const updateContact = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const { name, email, phone } = req.body;
    const result = await Contact.findByIdAndUpdate(
      contactId,
      { $set: { name, email, phone } },
      {
        new: true,
      }
    );
    if (!result) {
      return res.status(400).json({
        message: `Contact with id=${contactId} not found`,
      });
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
};
