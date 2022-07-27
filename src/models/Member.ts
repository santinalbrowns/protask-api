import mongoose from "mongoose";

interface Member {
    [x: string]: any;
    chat: any;
    user: any;
    status: STATUS;
    seen: any;
    deleted: boolean;
}

export enum STATUS {
    ONLINE = 'online',
    OFFLINE = 'offline',
}

const schema = new mongoose.Schema(
    {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: [STATUS.ONLINE, STATUS.OFFLINE], default: STATUS.OFFLINE },
        seen: {type: Date},
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model<Member>('Member', schema);