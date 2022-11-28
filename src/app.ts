import { config } from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import passport from "passport";
import { Server } from "socket.io";
import { connect } from "./config/database";
import formatMessage from "./messages";
import { errorHandler } from "./middleware/error";
import Chat from "./models/Chat";
import Member from "./models/Member";
import Message from "./models/Message";
import { current, getRoomUsers, join, userLeave } from "./users";

config();

//5tjSrBfVvPWILfKAomnUjDP14ymtA1JdIcYxV2KngsJ  | api key for livekit

connect();

const app = express();

app.use(cors())

// Passport middleware
app.use(passport.initialize());

/* app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,PATCH,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}); */

// Passport configuration
require('./config/passport')(passport);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', require('./routes/users'));

app.use('/api/projects', require('./routes/projects'));

app.use('/api/tasks', require('./routes/tasks'));

app.use(errorHandler);

const server = http.createServer(app);

const io = new Server(server);

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware: any) => (socket: any, next: any) => middleware(socket.request, {}, next);

io.use(wrap(passport.initialize()));
io.use(wrap(passport.authenticate('jwt', { session: false })));

io.use((socket: any, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error('unauthorized'))
    }
});

io.on('connection', async (socket) => {

    const req: any = socket.request;

    socket.join(req.user.id);

    //fetching chats;
    const chats: any = [];

    const members = await Member.find({ user: req.user.id }).populate('chat');

    await Promise.all(members.map(async (member) => {

        const members = await Member.find({ chat: member.chat }).populate('user');

        await Promise.all(members.map(async (user) => {

            if (user.user._id.toString() !== req.user.id) {
                const lastMessage = await Message.findOne({ chat: user.chat }).sort({ createdAt: -1 });
                const messages = await Message.find({ chat: user.chat });

                chats.push({
                    id: member.chat._id,
                    name: `${user.user.firstname} ${user.user.lastname}`,
                    prefix: `${user.user.firstname[0]}${user.user.lastname[0]}`.toUpperCase(),
                    message: lastMessage ? lastMessage.text : null,
                    image: '',
                    time: lastMessage ? lastMessage.createdAt : null,
                    status: user.status,
                    messages: messages.map((message) => {
                        return {
                            id: message._id,
                            text: message.text,
                            from: message.user,
                            isSender: message.user.toString() === req.user.id,
                            time: message.createdAt,
                        }
                    })
                });
            }
        }));
    }));

    socket.broadcast.emit('user connected', req.user);

    socket.emit('chats', chats);

    socket.on('message', async ({ content, to }) => {
        const message = {
            content,
            from: req.user.id,
            to,
        };

        const recipients = await Member.find({ user: req.user.id }).populate('chat');

        // Find if the conversation already exists
        if (recipients.length) {

            async function filter(arr: any[], callback: any) {
                const fail = Symbol()
                return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
            }

            const results = await filter(recipients, async (member: any) => {
                const user = await Member.findOne({ user: message.to, chat: member.chat._id });
                return user?.chat.toString() === member.chat._id.toString();
            });

            if (results.length) {
                //console.log('Add message');
                await Message.create({ text: message.content, user: message.from, chat: results[0].chat._id });
            } else {
                const chat = await Chat.create({ text: '' });

                await Member.create({ user: message.from, chat: chat._id });

                await Member.create({ user: message.to, chat: chat._id });

                await Message.create({ text: message.content, user: message.from, chat: chat._id });
            }

        } else {
            const chat = await Chat.create({ text: '' });

            await Member.create({ user: message.from, chat: chat._id });

            await Member.create({ user: message.to, chat: chat._id });

            await Message.create({ text: message.content, user: message.from, chat: chat._id });
        }

        //fetching chats;
        const chats: any = [];

        const recip = await Member.find({ user: req.user.id }).populate('chat');

        await Promise.all(recip.map(async (member) => {

            const members = await Member.find({ chat: member.chat }).populate('user');

            await Promise.all(members.map(async (user) => {

                if (user.user._id.toString() !== req.user.id) {
                    console.log(user);
                    const lastMessage = await Message.findOne({ chat: user.chat }).sort({ createdAt: -1 });
                    const messages = await Message.find({ chat: user.chat });

                    chats.push({
                        id: member.chat._id,
                        name: `${user.user.firstname} ${user.user.lastname}`,
                        prefix: `${user.user.firstname[0]}${user.user.lastname[0]}`.toUpperCase(),
                        message: lastMessage ? lastMessage.text : null,
                        image: '',
                        time: lastMessage ? lastMessage.createdAt : null,
                        status: user.status,
                        messages: messages.map((message) => {
                            return {
                                id: message._id,
                                text: message.text,
                                from: message.user,
                                isSender: message.user.toString() === req.user.id,
                                time: message.createdAt,
                            }
                        })
                    });
                }
            }));
        }));

        socket.to(to).to(req.user.id).emit("message", chats);
    });

    socket.on('disconnect', async () => {
        const sockets = await io.in(req.user.id).allSockets();

        const disconnected = sockets.size === 0;

        if (disconnected) {

            // notify other users
            socket.broadcast.emit('user disconnected', req.user);

            // update the connection status of the session
        }
    });
    /* socket.on('joinRoom', ({ room }) => {

        const user = join(req.user.id, req.user.firstname, room);

        socket.join(user.room);

        // Welcome a current user
        socket.emit('message', 'Welcome to Protask');

        //Broadcast on connect
        socket.broadcast.to(user.room).emit('message', `${user.username} has joined the chat`);

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

    });

    socket.on('chatMessage', (message) => {
        const user = current(req.user.id);

        if (user) {
            io.to(user.room).emit('message', formatMessage(user.username, message));
        }
    })

    socket.on('disconnect', () => {

        const user = userLeave(req.user.id);

        if (user) {
            io.to(user.room).emit('message', `${user.username} has left the chat`);

            //Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    }) */
})

server.listen(process.env.PORT, () => {
    console.log(`Server running on port: ${process.env.PORT}`);
});
