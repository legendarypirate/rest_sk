import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

export class AppException extends HttpException {
  constructor(
    readonly code: ErrorCode,
    status: HttpStatus,
  ) {
    super({ statusCode: status, message: code, code }, status);
  }
}

export class UnauthorizedAppException extends AppException {
  constructor(code: ErrorCode = ErrorCode.UNAUTHORIZED) {
    super(code, HttpStatus.UNAUTHORIZED);
  }
}

export class ForbiddenAppException extends AppException {
  constructor(code: ErrorCode = ErrorCode.FORBIDDEN) {
    super(code, HttpStatus.FORBIDDEN);
  }
}

export class NotFoundAppException extends AppException {
  constructor(code: ErrorCode = ErrorCode.NOT_FOUND) {
    super(code, HttpStatus.NOT_FOUND);
  }
}

export class ConflictAppException extends AppException {
  constructor(code: ErrorCode = ErrorCode.CONFLICT) {
    super(code, HttpStatus.CONFLICT);
  }
}

export class BadRequestAppException extends AppException {
  constructor(code: ErrorCode = ErrorCode.BAD_REQUEST) {
    super(code, HttpStatus.BAD_REQUEST);
  }
}

export class BadGatewayAppException extends AppException {
  constructor(code: ErrorCode = ErrorCode.INTEGRATION_ERROR) {
    super(code, HttpStatus.BAD_GATEWAY);
  }
}
