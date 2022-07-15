import { config } from "dotenv";
import express from "express";
import http from "http";
import passport from "passport";
import { Server } from "socket.io";
import { connect } from "./config/database";
import formatMessage from "./messages";
import { errorHandler } from "./middleware/error";
import { current, getRoomUsers, join, userLeave } from "./users";

config();

connect();

const app = express();

// Passport middleware
app.use(passport.initialize());

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

io.on('connection', (socket) => {

    const req: any = socket.request;


    const users = [];

    for (let [id, socket] of io.of('/').sockets) {
        const re: any = socket.request;
        users.push({
            userID: id,
            username: re.user.firstname
        })
    }

    socket.emit('users', users);

    socket.broadcast.emit("user connected", {
        userID: socket.id,
        username: req.user.firstname
    });

    socket.on('private message', ({content, to}) => {
        socket.to(to).emit('private message', {
            content,
            from: req.user.id
        })
    })
    

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
