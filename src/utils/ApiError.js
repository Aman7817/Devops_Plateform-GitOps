class ApiError extends Error {
    
     
    constructor(
        statusCode,
        message = "Something went wrong", // Default error message
        errors = [],                      // Default is an empty array for errors
        stack = ""                         // Optional: pass a custom stack trace or let it generate one
    ) {
        super(message);                    // Call the parent class (Error) constructor with the message

        this.statusCode = statusCode;      // Set the HTTP status code (e.g., 400, 500, etc.)
        this.data = null;                  // No data in errors by default, just the message and status
        this.message = message;            // Set the error message
        this.success = false;              // Success will be false for errors (obviously)
        this.errors = errors;              // Store the array of specific errors (like validation details)

        // If a custom stack trace is passed, use it, otherwise generate one automatically
        if (stack) {
            this.stack = stack;            // Use the provided stack trace
        } else {
            Error.captureStackTrace(this, this.constructor); // Automatically capture the stack trace
        }
    } // This part is for custom error handling.
}

// Export the ApiError class so we can use it elsewhere
export { ApiError };