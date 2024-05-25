class ApiResponse{
  constructor(success,statusCode,data,message="Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}