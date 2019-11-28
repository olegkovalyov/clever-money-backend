class AppError extends Error {
  _statusCode = 500;
  _message = 'Internal server error';
  _errors = null;

  constructor() {
    super();
  }

  get statusCode() {
    return this._statusCode;
  }

  set statusCode(value) {
    this._statusCode = value;
  }

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
}

module.exports = AppError;