class ApiResponse {
  constructor(statusCode, message = "Operation successful", data = null, pagination = null) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    if (data !== null && data !== undefined) {
      this.data = data;
    }
    if (pagination !== null && pagination !== undefined) {
      this.pagination = pagination;
    }
  }

  send(res) {
    const responsePayload = {
      success: this.success,
      message: this.message,
    };

    if (this.data !== undefined) {
      responsePayload.data = this.data;
    }

    if (this.pagination !== undefined) {
      responsePayload.pagination = this.pagination;
    }

    return res.status(this.statusCode).json(responsePayload);
  }
}

export default ApiResponse;
