class ApiResponse {
    constructor(status, data, message = "Success"  ) {
        this.status = status;
        this.data = data;
        this.message = message;
        this.sucess = statusCode < 400;
    }
}

export {ApiResponse};