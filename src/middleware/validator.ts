import { NextFunction, Request, response, Response } from "express";

const validate = (schema: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            const body = await schema.validate(req.body);

            req.body = body;

            next();

        } catch (error: any) {

            response.status(400);
            next(error);

        }
    }
}

export default validate;