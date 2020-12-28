const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const path = require('path') // core node module, no need to insatll explicitly
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public')

// express static middleware
// The first argument specifies the root directory from which to serve static assets
app.use(express.static(publicDirectoryPath))

const testUser = addUser({ "id": "test", "username": "test", "room": "test" })
console.log(testUser, "testUser");

io.on('connection', (socket) => {
    console.log("New websocket connection")
    // socket.emit('message', generateMessage('Welcome!'));
    // socket.broadcast.emit('message', generateMessage('A new member has joined!'))

    // Every single connection has a unique id associated with it
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error); // now setup callback for join event in chat.js
        }

        socket.join(user.room) // allows us to join a given chat room

        socket.emit('message', generateMessage('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room) 
        })
        callback();

        // socket.emit, io.emit, socket.broadcast.emit => send event from server to client 
        // io.to.emit => to send message to everyone in that room
        // socket.broadcast.to.emit => send message to evreyone in that CHATROOM expect the particular user
    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        let filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));

        // callback() //call callback to acknowledge the event
        // we can also pass arguments to callback(), which can be accessed in client side
        callback()
    })

    socket.on('sendLocation', (coordinates, callback) => {
        const user = getUser(socket.id);

        let { latitude, longitude } = coordinates;
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    // let count = 0;
    // we get this when a new client connects
    // socket.emit('countUpdated', count);
    // socket.on('increment', () => {
    //     count += 1;
    //     // socket.emit('countUpdated', count);
    //     io.emit('countUpdated', count);
    // })
})

server.listen(port, () => {
    console.log(`Server up in ${port}`)
})

// While emitting, 1st parameter is event name, followed by any number of values => socket.emit('message', 'Welcome!');
// Instead we can send first argumnent as event name and an object with all the values