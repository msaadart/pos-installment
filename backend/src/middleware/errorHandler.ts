import { Request, Response, NextFunction } from 'express';

// Global Error Handler Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Log the actual error internally (could use Winston, Morgan, etc., here it's console.error)
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    console.error(err);

    // If headers have already been sent, delegate to default Express error handler
    if (res.headersSent) {
        return next(err);
    }

    // Default status code and message
    let statusCode = err.status || 500;
    let message = 'Internal Server Error';

    // If it's a known operational error, we can expose the message (e.g., 400 Bad Request, 401 Unauthorized)
    if (statusCode < 500 && err.message) {
        message = err.message;
    }

    // Return a clean JSON response without sensitive database/stack trace data
    res.status(statusCode).json({
        success: false,
        message: message,
        // Optionally include error code if needed by client, e.g., error: 'VALIDATION_ERROR'
    });
};
