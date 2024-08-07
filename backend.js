const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
//Server pings player 2 times before disconnecting them
const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });

const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const backEndPlayers = {};
const rooms = {};

//Creates a random 6 letter room code
function generateRoomCode() {
  let roomCode = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
      roomCode += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return roomCode;
}

io.on('connection', (socket) => {
  // console.log('a user connected');

  // If a player disconnects, delete them from the list of players
  // and from their respective room
  socket.on('disconnect', (reason) => {
    console.log(reason);
    const player = backEndPlayers[socket.id];
    if (player && player.roomCode) {
      const room = rooms[player.roomCode];
      if (room) {
        room.players = room.players.filter(id => id !== socket.id);
        //If the room is empty, delete the room too
        if (room.players.length === 0) {
          delete rooms[player.roomCode];
        }
      }
    }
    delete backEndPlayers[socket.id];
    io.emit('updatePlayers', backEndPlayers);
  });

  //calls initGame when a room is created through "CREATE A ROOM"
  socket.on('initGame', (username) => {
    const roomCode = generateRoomCode();
    backEndPlayers[socket.id] = { Username: username, roomCode };
    rooms[roomCode] = { players: [socket.id], creator: username };
    socket.emit('roomCode', { roomCode, creator: username });
    console.log('Player created:', username);
    console.log('Room created:', roomCode);
  });

  
  socket.on('joinRoom', ({ roomCode, username }) => {
    const room = rooms[roomCode];
    if (room) {
      if (room.players.length === 1) {
        backEndPlayers[socket.id] = { Username: username, roomCode };
        room.players.push(socket.id);
        console.log('Player created:', username);

        console.log('Room Joined:', roomCode);
        socket.emit('joinSuccess', { roomCode, creator: room.creator });

        // Notify the creator that a player has joined
        const creatorSocketId = room.players[0];
        // console.log('Emitting playerJoined to:', creatorSocketId);
        io.to(creatorSocketId).emit('playerJoined', username);
        // console.log('PLAYERJOINED   WOOOOOOOOOOOO');
      } else {
        socket.emit('joinFailure', 'Room is full.');
      }
    } else {
      socket.emit('joinFailure', 'Room does not exist.');
    }
  });

  //When the creator of the room presses "START"
  socket.on('startGame', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      room.players.forEach(playerId => {
        io.to(playerId).emit('startGame');
      });
    }
  });

  io.emit('updatePlayers', backEndPlayers);
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
