import mongoose from "mongoose";

interface Conversation {
    [x: string]: any;
    name: string;
}

const schema = new mongoose.Schema(
    {
        name: { type: String, default: null },
    },
    { timestamps: true }
);

export default mongoose.model<Conversation>('Conversation', schema);