export class ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T | null;

  constructor(
    isSuccess: boolean,
    code: string,
    message: string,
    result: T | null,
  ) {
    this.isSuccess = isSuccess;
    this.code = code;
    this.message = message;
    this.result = result;
  }

  static success<T>(code: string, message: string, result: T): ApiResponse<T> {
    return new ApiResponse(true, code, message, result);
  }

  static error(code: string, message: string): ApiResponse<null> {
    return new ApiResponse(false, code, message, null);
  }
}
