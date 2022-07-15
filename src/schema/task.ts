import { boolean, date, object, ref, string } from "yup";

export const create = object({
    user: string().required(),
    project: string().required(),
    completed: boolean().notRequired(),
    due: date().required(),
    name: string().required().max(45)
});

export const update = object({
    user: string().notRequired(),
    project: string().notRequired(),
    completed: boolean().notRequired(),
    due: date().notRequired(),
    name: string().notRequired().max(45)
});