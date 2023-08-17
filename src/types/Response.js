class Response {
  constructor(status, error, message, data) {
    this.status = status,
    this.error = error;
    this.message = message;
    this.data = data;
  }
}


module.exports = Response;
