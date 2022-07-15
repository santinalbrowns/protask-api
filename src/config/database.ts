import mongoose from "mongoose";

export async function connect() {
    const url : any = process.env.MONGO_URI;

    try {
        const db = await mongoose.connect(url);

        //console.log(`Database connected at: ${db.connection.host}`)

    } catch (error) {
        console.log("Could not connect to database");

        process.exit(1);
    }
}