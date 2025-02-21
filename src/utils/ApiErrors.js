class ApiError extends Error {
    constructor(
        statusCode,
        message = "An unknown error occurred!",
        errors = [],
        statck = "",
    ){
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.message = message;
        this.success = false;
        this.data = null;

        if(statck){
            this.stack = stack;
        }else{
            Error.captureStackTrace(this, this.constructor);
        }
    }

}

export {ApiError};