import mongoose from "mongoose";

interface Chat {
    [x: string]: any;
    name: string;
}

const schema = new mongoose.Schema(
    {
        name: { type: String, default: null },
    },
    { timestamps: true }
);

export default mongoose.model<Chat>('Chat', schema);