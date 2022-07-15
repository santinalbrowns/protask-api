import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import { verify } from "../helpers/jwt";
import User from "../models/User";

export const protect = async (request: Request, response: Response, next: NextFunction) => {
    const token = get(request, 'headers.authorization', '').replace('Bearer', '').trim();

    try {

        if (!token) {
            response.status(401);
            throw new Error('No token');
        };

        const payload: any = verify(token);

        const user = await User.findById(payload.id);

        if (!user) {
            response.status(401);
            throw new Error('Not authorized');
        }

        response.locals.user = user;

        next();

    } catch (error) {
        next(error);
    }
}

export const guard = (...titles: any[string]) => {
    return async (request: Request, response: Response, next: NextFunction) => {

        const user = response.locals.user;

        try {
            if (!user) {
                response.status(401);

                throw new Error('You are not authorized to access this resource');
            }

            //const roles = new Set(titles);

        } catch (error) {
            next(error);
        }
    }
}