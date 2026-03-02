class ApiResponse {

    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // HTTP status (like 200, 400, etc.)
        this.data = data;             // The actual data we're sending back to the client
        this.message = message;       // Custom message (but default is "Success" if no message is passed)
        
        // Here we check if the response is a success. Anything below 400 is a win.
        this.success = statusCode < 400; 
    }
}

export {
    ApiResponse
}