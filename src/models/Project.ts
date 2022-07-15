import mongoose from "mongoose";

interface Project {
    [x: string]: any;
    name: string;
    description: string;
    user: any;
    due: any;
    status: STATUS
}

export enum STATUS {
    INPROGRESS = 'In progress',
    NOTSTARTED = 'Not started',
    COMPLETED = 'Completed'
}

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        due: { type: Date, required: true },
        status: { type: String, enum: [STATUS.NOTSTARTED, STATUS.INPROGRESS, STATUS.COMPLETED], default: STATUS.NOTSTARTED },
    },
    { timestamps: true }
);

export default mongoose.model<Project>('Project', schema);
