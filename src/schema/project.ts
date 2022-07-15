import { date, object, ref, string } from "yup";
import { STATUS } from "../models/Project";

function formatDate(date: any) {
    return new Date(date).toLocaleDateString()
}

export const create = object({
    due: date().required(),
    description: string().notRequired().max(250),
    name: string().required().max(45)
});

export const update = object({
    status: string().oneOf([STATUS.NOTSTARTED, STATUS.INPROGRESS, STATUS.COMPLETED]),
    due: date().notRequired(),
    description: string().notRequired().max(250),
    name: string().notRequired().max(45)
});