import { NextFunction, Request, Response } from "express";
import { sign } from "../helpers/jwt";
import User from "../models/User";

function formatUser(user: any) {
    return {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        created_at: user.createdAt,
        updated_at: user.updatedAt
    }
}

export async function getUsers(request: Request, response: Response, next: NextFunction) {
    try {
        const users = await User.find();

        const body = users.map((user: any) => {
            return formatUser(user);
        });

        response.status(200).json(body);

    } catch (error) {
        next(error);
    }
}

export async function getUser(request: Request, response: Response, next: NextFunction) {
    try {
        const user = await User.findById(request.params.id);

        if(!user) {
            response.status(404);

            throw new Error('User not found');
        }

        response.status(200).json(formatUser(user));

    } catch (error) {
        next(error);
    }
}

export async function createUser(request: Request, response: Response, next: NextFunction) {
    try {

        const result = await User.findOne({ email: request.body.email });

        if (result) {
            response.status(400);

            throw new Error('User with the email provided already exists');
        }

        const user = await User.create({
            firstname: request.body.firstname,
            lastname: request.body.lastname,
            email: request.body.email,
            password: request.body.password
        });

        const body = formatUser(user)

        response.status(201).json(body);

    } catch (error) {
        next(error);
    }
}

export async function loginUser(request: Request, response: Response, next: NextFunction) {
    try {


        const user = await User.findOne({ email: request.body.email });

        if (!user) {
            response.status(400);
            throw new Error('Invalid credentials');
        }

        const valid = await user.comparePassword(request.body.password);

        if (!valid) {
            response.status(400);
            throw new Error('Invalid credentials');
        }

        const body = {
            ...formatUser(user),
            token: sign(user._id)
        }

        response.status(200).json(body);
    } catch (error) {
        next(error);
    }
}

export async function updateUser(request: Request, response: Response, next: NextFunction) {
    try {

        const user = await User.findById(request.params.id);

        if(!user) {
            response.status(404);
            throw new Error('User not found');
        }

        if(request.body.firstname) user.firstname = request.body.firstname;

        if(request.body.lastname) user.lastname = request.body.lastname;

        if(request.body.email) user.email = request.body.email;

        if(request.body.password) user.password = request.body.password;

        await user.save();

        response.status(200).json(formatUser(user));
        
    } catch (error) {
        next(error);
    }
}

export async function deleteUser(request: Request, response: Response, next: NextFunction) {
    try {
        
        const user = await User.findById(request.params.id);

        if(!user) {
            response.status(404);
            throw new Error('User not found');
        }

        await user.remove();

        response.status(200).json({id: request.params.id});

    } catch (error) {
        next(error);
    }
}

export async function getMe(request: Request, response: Response, next: NextFunction) {
    try {

        const user = response.locals.user;

        response.status(200).json(formatUser(user));
    } catch (error) {
        next(error);
    }
}