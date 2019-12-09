const Joi = require('@hapi/joi');
const AppError = require('../classes/AppError');
const httpStatus = require('http-status-codes');
const errorConstants = require('../constants/Error');

class DataValidator {
  get errorCode() {
    return this._errorCode;
  }

  set errorCode(value) {
    this._errorCode = value;
  }

  _message = null;
  _errors = null;
  _errorCode = null;

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
      this._errorCode = errorConstants.INVALID_ID;
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
      this._errorCode = errorConstants.INVALID_DATE;
      return false;
    } else {
      return true;
    }
  }

  validatePasswordConfirm(password, passwordConfirm) {
    this.reset();
    if (!this.validatePassword(password)) {
      return false;
    }
    if (password !== passwordConfirm) {
      this._message = 'Password confirmation error';
      this._errorCode = errorConstants.PASSWORD_CONFIRMATION_ERROR;
      this._errorCode = {
        password: password,
        passwordConfirm: passwordConfirm || null,
      };
      return false;
    }
    return true;
  }

  validateName(name) {
    this.reset();
    const validationSchema = Joi.object({
      name: Joi.string().min(2).max(50).required(),
    });
    const validationResult = validationSchema.validate({name: name});
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errors = {
        name: name || null,
      };
      this._errorCode = errorConstants.INVALID_NAME;
      return false;
    } else {
      return true;
    }
  }

  validateEmail(email) {
    this.reset();
    const validationSchema = Joi.object({
      email: Joi.string().email().required(),
    });
    const validationResult = validationSchema.validate({email: email});
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errors = {
        email: email || null,
      };
      this._errorCode = errorConstants.INVALID_EMAIL_OR_PASSWORD;
      return false;
    } else {
      return true;
    }
  }

  validatePassword(password) {
    this.reset();
    const validationSchema = Joi.object({
      password: Joi.string().min(7).required(),
    });
    const validationResult = validationSchema.validate({password: password});
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errorCode = errorConstants.INVALID_EMAIL_OR_PASSWORD;
      this._errors = {
        password: password || null,
      };
      return false;
    } else {
      return true;
    }
  }

  validateResetToken(token) {
    this.reset();
    const validationSchema = Joi.object({
      token: Joi.string().length(64),
    });
    const validationResult = validationSchema.validate({token: token});
    if (validationResult.error !== undefined) {
      this._message = validationResult.error.details[0].message;
      this._errorCode = errorConstants.INVALID_RESET_TOKEN;
      this._errors = {
        token: token || null,
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

  getErrorObject() {
    let error = new AppError();
    error.statusCode = httpStatus.BAD_REQUEST;
    error.message = this.message;
    error.errors = this.errors;
    error.errorCode = this.errorCode;
    return error;
  }
}

module.exports = DataValidator;
