import mongoose from "mongoose";
import * as bcrypt from 'bcrypt';

interface User {
    [x: string]: any;
    firstname: string;
    lastname: string;
    email: string;
    password: string;
}

const schema = new mongoose.Schema({
    firstname: { type: String, required: true, },
    lastname: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

schema.pre("save", async function (next) {

    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    const salf = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salf);

    user.password = hash;

    return next();
});

schema.methods.comparePassword = async function (password: string): Promise<boolean> {

    const user = this;

    return bcrypt.compare(password, user.password).catch((e) => false);
}

export default mongoose.model<User>('User', schema);