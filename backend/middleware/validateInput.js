const { validationResult, checkSchema } = require('express-validator');

// Middleware to validate input based on a schema
const validateInput = (schema) => {
  return [
    checkSchema(schema),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }
      next();
    }
  ];
};

module.exports = validateInput;