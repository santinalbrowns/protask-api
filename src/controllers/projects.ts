import { NextFunction, Request, Response } from "express";
import Project from "../models/Project";

function formatProject(project: any) {
    return {
        id: project._id,
        name: project.name,
        description: project.description,
        user: project.user,
        due: project.due,
        status: project.status
    }
}

export async function getProjects(request: Request, response: Response, next: NextFunction) {
    try {

        const projects = await Project.find({ user: response.locals.user._id });

        const body = projects.map((project) => formatProject(project));

        response.status(200).json(body);

    } catch (error) {
        next(error);
    }
}

export async function getProject(request: Request, response: Response, next: NextFunction) {
    try {

        const project = await Project.findOne({ _id: request.params.id, user: response.locals.user._id });

        if(!project) {
            response.status(404);

            throw new Error('Project not found');
        }

        response.status(200).json(formatProject(project));

    } catch (error) {
        next(error);
    }
}

export async function createProject(request: Request, response: Response, next: NextFunction) {
    try {
        const project = await Project.create({
            name: request.body.name,
            description: request.body.description,
            user: response.locals.user._id,
            due: request.body.due,
        });

        response.status(201).json(formatProject(project));

    } catch (error) {

    }
}

export async function updateProject(request: Request, response: Response, next: NextFunction) {
    try {
        const project = await Project.findOne({ _id: request.params.id, user: response.locals.user._id });

        if (!project) {
            response.status(404);

            throw new Error('Project not found.');
        }

        if (request.body.name) project.name = request.body.name;

        if (request.body.description) project.description = request.body.description;

        if (request.body.due) project.due = request.body.due;

        if (request.body.status) project.status = request.body.status;

        await project.save();

        response.status(200).json(formatProject(project));

    } catch (error) {
        next(error);
    }
}

export async function deleteProject(request: Request, response: Response, next: NextFunction) {
    try {
        const project = await Project.findOne({ _id: request.params.id, user: response.locals.user._id });

        if (!project) {
            response.status(404);

            throw new Error('Project not found');
        }

        await project.remove();

        response.status(200).json({ id: request.params.id });
    } catch (error) {
        next(error);
    }
}