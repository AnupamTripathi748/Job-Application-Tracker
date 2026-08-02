export class CustomAPIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends CustomAPIError {
  constructor(message) {
    super(message, 400); // 400 Bad Request
  }
}

export class UnauthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message, 401); // 401 Unauthorized
  }
}

export class NotFoundError extends CustomAPIError {
  constructor(message) {
    super(message, 404); // 404 Not Found
  }
}

export class ForbiddenError extends CustomAPIError {
  constructor(message) {
    super(message, 403); // 403 Forbidden
  }
}
