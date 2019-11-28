const Joi = require('@hapi/joi');

class DataValidator {
  _message = null;
  _errors = null;

  get message() {
    return this._message;
  }

  set message(value) {
    this._message = value;
  }

  get errors() {
    return this._errors;
  }

  set errors(value) {
    this._errors = value;
  }

  validateMongoId(id) {
    this.reset();
    const validationSchema = Joi.string().alphanum().length(24);
    const validationResult = validationSchema.validate(id);
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errors = {
        id: id,
      };
      return false;
    } else {
      return true;
    }
  }

  validateDate(fieldName, value) {
    this.reset();
    value = value || null;
    const validationSchema = Joi.object({
      [fieldName]: Joi.date().required(),
    });
    const validationResult = validationSchema.validate({[fieldName]: value});
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errors = {
        [fieldName]: value || null,
      };
      return false;
    } else {
      return true;
    }
  }

  validateName(name) {
    this.reset();
    const validationSchema = Joi.object({
      name: Joi.string().min(3).max(10).required(),
    });
    const validationResult = validationSchema.validate({name: name});
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errors = {
        name: name || null,
      };
      return false;
    } else {
      return true;
    }
  }

  reset() {
    this._message = null;
    this._errors = null;
  }
}

module.exports = DataValidator;