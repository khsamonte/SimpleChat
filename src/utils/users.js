// Tracks all of the users in the chat application

const users = [];

// #1: ADD USER TO THE ROOM
const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Check if fields are empty
  if (!username || !room) {
    return {
      error: 'Username and room are required.'
    };
  }

  // Check if username already exists
  const existingUser = users.find(user => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username already exists.'
    };
  }

  // Once all validations are met, store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

// #2: REMOVE USER TO THE ROOM
const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

// #3: GET USER
const getUser = id => {
  const user = users.find(user => user.id === id);

  if (user) {
    return user;
  }

  return 'User does not exist.';
};

// #4: GET USERS IN A ROOM
const getUsersInRoom = room => {
  room = room.trim().toLowerCase();
  const roomUsers = users.filter(user => user.room === room);

  if (roomUsers) {
    return roomUsers;
  }

  return 'This room is empty';
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
