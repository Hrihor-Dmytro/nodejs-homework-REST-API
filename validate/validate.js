const Joi = require("joi");

module.exports = {
  validateSchema: (req, res, next) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().trim().required(),
      phone: Joi.string().min(3).max(10).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: error.details });
    }
    next();
  },
  passwordJoiValidation: (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().min(6).required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: error.details });
    }
    next();
  },
  loginJoiValidation: (req, res, next) => {
    const schema = Joi.object({
      password: Joi.string().min(6).required(),
      email: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: error.details });
    }
    next();
  },
};
