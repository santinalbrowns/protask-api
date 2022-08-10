import { NextFunction, Request, Response } from "express";
import Project from "../models/Project";
import Task from "../models/Task";
import User from "../models/User";
import { formatUser } from "./users";

export function formatTask(task: any) {
    return {
        id: task._id,
        name: task.name,
        due: task.due,
        completed: task.completed,
        project: task.project,
        user: formatUser(task.user),
    }
}

export async function getTasks(request: any, response: Response, next: NextFunction) {
    try {
        if (request.query.filter === 'completed') {

            const tasks = await Task.find({ user: request.user.id, completed: true }).populate('user');
            const body = tasks.map((task) => formatTask(task));
            return response.status(200).json(body);
        }

        if (request.query.filter === 'incomplete') {
            const tasks = await Task.find({ user: request.user.id, completed: false }).populate('user');
            const body = tasks.map((task) => formatTask(task));
            return response.status(200).json(body);
        }

        const tasks = await Task.find({ user: request.user.id }).populate('user');
        const body = tasks.map((task) => formatTask(task));

        return response.status(200).json(body);

    } catch (error) {
        next(error);
    }
}

export async function getTask(request: any, response: Response, next: NextFunction) {
    try {
        const task = await Task.findOne({ _id: request.params.id, user: request.user.id }).populate('user');

        if (!task) {
            response.status(404);

            throw new Error('Task not found');
        }

        response.status(200).json(formatTask(task));

    } catch (error) {
        next(error);
    }
}

export async function createTask(request: any, response: Response, next: NextFunction) {
    try {

        const project = await Project.findOne({ _id: request.body.project, user: request.user.id });

        if (!project) {
            response.status(404);

            throw new Error('Project not found');
        }

        const user = await User.findById(request.body.user);

        if (!user) {
            response.status(404);

            throw new Error('User not found');
        }

        const task = await Task.create({
            name: request.body.name,
            due: request.body.due,
            project: request.body.project,
            user: request.body.user,
        });

        response.status(201).json(formatTask(task));

    } catch (error) {
        next(error);
    }
}

export async function updatedTask(request: any, response: Response, next: NextFunction) {
    try {

        const task = await Task.findOne({ _id: request.params.id, user: request.user.id }).populate('user');

        if (!task) {
            response.status(404);

            throw new Error('Task not found');
        }

        if (request.body.name) task.name = request.body.name;

        if (request.body.due) task.due = request.body.due;

        if (request.body.completed != undefined) task.completed = request.body.completed;

        if (request.body.project) task.project = request.body.project;

        if (request.body.user) task.user = request.body.user;

        await task.save();

        response.status(200).json(formatTask(task));

    } catch (error) {
        next(error);
    }
}

export async function deleteTask(request: any, response: Response, next: NextFunction) {
    try {
        const task = await Task.findOne({ _id: request.params.id, user: request.user.id });

        if (!task) {
            response.status(404);

            throw new Error('Task not found');
        }

        await task.remove();

        response.status(200).json({ id: request.params.id });

    } catch (error) {
        next(error);
    }
}