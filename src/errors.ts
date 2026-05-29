export class CallMeBotError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code = "CALLMEBOT_ERROR", cause?: unknown) {
    super(message);
    this.name = "CallMeBotError";
    this.code = code;
    this.cause = cause;
  }
}

export class ValidationError extends CallMeBotError {
  constructor(message: string, cause?: unknown) {
    super(message, "VALIDATION_ERROR", cause);
    this.name = "ValidationError";
  }
}

export class HttpError extends CallMeBotError {
  readonly status?: number;
  constructor(message: string, status?: number, cause?: unknown) {
    super(message, "HTTP_ERROR", cause);
    this.name = "HttpError";
    this.status = status;
  }
}

export class RetryExhaustedError extends CallMeBotError {
  constructor(message: string, cause?: unknown) {
    super(message, "RETRY_EXHAUSTED", cause);
    this.name = "RetryExhaustedError";
  }
}
