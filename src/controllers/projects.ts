import { NextFunction, Request, Response } from "express";
import Project, { STATUS } from "../models/Project";
import Task from "../models/Task";
import { formatTask } from "./tasks";
import { formatUser } from "./users";

async function formatProject(project: any) {
    const all = await Task.find({ project: project._id });

    const completed = all.filter((task) => task.completed);

    const progress = completed.length / all.length * 100 / 100;

    return {
        id: project._id,
        name: project.name,
        description: project.description,
        user: formatUser(project.user),
        due: project.due,
        progress: progress || 0,
        status: progress > 0 ? STATUS.INPROGRESS : progress == 100 ? STATUS.COMPLETED : STATUS.NOTSTARTED,
        created_at: project.createdAt,
        updated_at: project.updatedAt,
    }
}

export async function getProjects(request: any, response: Response, next: NextFunction) {
    try {

        const project_ids: string[] = [];

        const projects = await Project.find({user: request.user.id}).populate('user');

        const tasks  = await Task.find({user: request.user.id});

        tasks.map((task) => {
            if(project_ids.length) {
                project_ids.forEach(id => {
                    if(id != task.project.toString()) {
                        project_ids.push(task.project.toString());
                    }
                });
            } else {
                project_ids.push(task.project.toString());
            }
        });

        const other = await Project.find({_id: project_ids}).populate('user');

        other.map((project) => {
            projects.push(project);
        })

        const body = await Promise.all(projects.map(async (project) => await formatProject(project)));

        response.status(200).json(body);

    } catch (error) {
        next(error);
    }
}

export async function getProject(request: any, response: Response, next: NextFunction) {
    try {

        const project = await Project.findOne({ _id: request.params.id}).populate('user');

        if (!project) {
            response.status(404);

            throw new Error('Project not found');
        }

        response.status(200).json(await formatProject(project));

    } catch (error) {
        next(error);
    }
}

export async function getProjectTasks(request: Request, response: Response, next: NextFunction) {
    try {

        const project = await Project.findOne({ _id: request.params.id });

        if (!project) {
            response.status(404);

            throw new Error('Project not found');
        }

        const tasks = await Task.find({ project: project._id }).populate('user');

        const body = tasks.map((task) => {
            return formatTask(task);
        });

        response.status(200).json(body);

    } catch (error) {
        next(error);
    }
}

export async function createProject(request: any, response: Response, next: NextFunction) {
    try {
        const newProject = await Project.create({
            name: request.body.name,
            description: request.body.description,
            user: request.user.id,
            due: request.body.due,
        });

        const project = await Project.findById(newProject._id).populate('user');

        response.status(201).json(await formatProject(project));

    } catch (error) {

    }
}

export async function updateProject(request: any, response: Response, next: NextFunction) {
    try {
        const project = await Project.findOne({ _id: request.params.id, user: request.user.id }).populate('user');

        if (!project) {
            response.status(404);

            throw new Error('Project not found.');
        }

        if (request.body.name) project.name = request.body.name;

        if (request.body.description) project.description = request.body.description;

        if (request.body.due) project.due = request.body.due;

        await project.save();

        response.status(200).json(await formatProject(project));

    } catch (error) {
        next(error);
    }
}

export async function deleteProject(request: any, response: Response, next: NextFunction) {
    try {
        const project = await Project.findOne({ _id: request.params.id, user: request.user.id });

        if (!project) {
            response.status(404);

            throw new Error('Project not found');
        }

        const tasks = await Task.find({ project: project._id });

        await Promise.all(tasks.map(async (task) => {
            await task.remove();
        }));

        await project.remove();

        response.status(204).json({ id: request.params.id });
    } catch (error) {
        next(error);
    }
}