import mongoose from "mongoose";

interface Member {
    [x: string]: any;
    conversation: any;
    user: any;
    seen: any;
    deleted: boolean;
}

const schema = new mongoose.Schema(
    {
        conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        seen: { type: Date },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<Member>('Member', schema);