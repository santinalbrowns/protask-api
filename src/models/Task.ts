import mongoose from "mongoose";

interface Task {
    [x: string]: any;
    name: string;
    due: any;
    completed: any;
    project: any;
    user: any;
}

const schema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        due: { type: Date, required: true },
        completed: { type: Boolean, required: true, default: false },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<Task>('Task', schema);
