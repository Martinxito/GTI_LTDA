class ServiceError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ServiceError';
    this.status = options.status || 500;
    this.code = options.code;
    this.details = options.details;
  }
}

module.exports = { ServiceError };
