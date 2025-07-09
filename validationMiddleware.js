const Joi = require('joi');

const validateRegisterInput = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string().regex(/^0[17]\d{8}$/).required()
      .messages({
        'string.pattern.base': 'Phone must start with 07 or 01 and be 10 digits'
      }),
    gender: Joi.string().valid('male', 'female').required(),
    password: Joi.string().min(6).required(),
    referralCode: Joi.string().allow('').optional(),
  });

  return schema.validate(data);
};

const validateLoginInput = (data) => {
  const schema = Joi.object({
    phone: Joi.string().regex(/^0[17]\d{8}$/).required()
      .messages({
        'string.pattern.base': 'Phone must start with 07 or 01 and be 10 digits'
      }),
    password: Joi.string().required(),
  });

  return schema.validate(data);
};

module.exports = { validateRegisterInput, validateLoginInput };