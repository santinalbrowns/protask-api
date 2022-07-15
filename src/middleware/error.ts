import { NextFunction, Request, Response } from "express";

const errorHandler = (err: Error, request: Request, response: Response, next: NextFunction) => {
    const status = response.statusCode ? response.statusCode : 500;

    const stack = process.env.NODE_ENV === 'production' ? undefined : err.stack;

    return response.status(status).json({
        code: status,
        message: err.message,
        stack
    });
}

export {
    errorHandler
}