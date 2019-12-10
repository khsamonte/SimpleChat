const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

// Generate a new application
// Configuring web sockets to work with the server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set up the port and the public directory
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

// Set up static directory (i.e. HTML) to serve
app.use(express.static(publicDirectoryPath));

// (event, function)
io.on('connection', socket => {
  // Event Listener: A user has joined the room
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // Only useable in server: socket.join allows us to join a given chat room
    socket.join(user.room);

    // Event Emitter: Welcome messages
    socket.emit('deliverMessage', generateMessage('Server', 'Welcome!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'deliverMessage',
        generateMessage('Server', `${user.username} has joined ${user.room}.`)
      );
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  // Event Listener: A user has sent a message
  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'deliverMessage',
        generateMessage(user.username, message)
      );
      callback('The message was delivered!');
    }
  });

  // Event Listener: A user has shared their location
  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);

    if (user) {
      const url = `https://google.com/maps?q=${latitude},${longitude}`;
      io.to(user.room).emit(
        'deliverLocation',
        generateLocationMessage(user.username, url)
      );
      callback('The location was delivered!');
    }
  });

  // Event Listener: A user has disconnected
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'deliverMessage',
        generateMessage('Server', `${user.username} has left ${user.room}!`)
      );

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// Listen to the port to serve the Express app
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
