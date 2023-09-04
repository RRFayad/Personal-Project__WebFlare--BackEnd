class HttpError extends Error {
  constructor(message, errorCode) {
    // I created this only to crete my error using 1 line
    super(message);
    this.code = errorCode;
  }
}

module.exports = HttpError;
