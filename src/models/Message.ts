import mongoose from "mongoose";

interface Message {
    [x: string]: any;
    user: string;
    text: string;
    conversation: any;
}

const schema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true }
    },
    { timestamps: true }
);

export default mongoose.model<Message>('Message', schema);