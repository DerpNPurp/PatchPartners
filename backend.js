const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, { pingInterval: 2000, pingTimeout: 5000 });
const port = 3000;

const backEndPlayers = {};
const rooms = {};
const playersReady = {}; // Track readiness of players by their room code

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Creates a random 6 letter room code
function generateRoomCode() {
  let roomCode = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    roomCode += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return roomCode;
}


//list of all prompts
const prompts = [
  "Draw a heart!",
  "Draw anything!"
];


function getRandomPrompt() {
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}



io.on('connection', (socket) => {
  // Handle player disconnect
  socket.on('disconnect', (reason) => {
    console.log(reason);
    const player = backEndPlayers[socket.id];
    if (player && player.roomCode) {
      const room = rooms[player.roomCode];
      if (room) {
        room.players = room.players.filter(id => id !== socket.id);
        if (room.players.length === 0) {
          delete rooms[player.roomCode];
        }
      }
    }
    delete backEndPlayers[socket.id];
    io.emit('updatePlayers', backEndPlayers);
  });

  // Handle room creation
  socket.on('initGame', (username) => {
    const roomCode = generateRoomCode();
    backEndPlayers[socket.id] = { Username: username, roomCode };
    rooms[roomCode] = { players: [socket.id], creator: username };
    socket.emit('roomCode', { roomCode, creator: username });
    console.log('Player created:', username);
    console.log('Room created:', roomCode);
  });

  // Handle player joining a room
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
        io.to(creatorSocketId).emit('playerJoined', username);
      } else {
        socket.emit('joinFailure', 'Room is full.');
      }
    } else {
      socket.emit('joinFailure', 'Room does not exist.');
    }
  });
  
  socket.on('startGame', ({ roomCode }) => {
    const room = rooms[roomCode];
    if (room) {
      const prompt = getRandomPrompt();
      // console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
      room.players.forEach(playerId => {
        io.to(playerId).emit('startGame', {prompt});
      });
    }
  });


  socket.on('playerReady', ({ roomCode }) => {
    if (!playersReady[roomCode]) {
        playersReady[roomCode] = [];
    }
    playersReady[roomCode].push(socket.id);

    if (playersReady[roomCode].length === 2 || roomCode == 111111) {
      const startTime = Date.now();
      playersReady[roomCode].forEach(playerSocketId => {
          io.to(playerSocketId).emit('startDrawing');
          io.to(playerSocketId).emit('startTimer', { duration: 10000, startTime }); // change this time when testing
      });

        // Clear the readiness list for the room
        delete playersReady[roomCode];
    } else {
        // Notify the first player to wait for the other player
        socket.emit('waitingForPlayer');
    }
  });

  // timer code
  // socket.on('playerReady', ({ roomCode }) => {
  //   if (!playersReady[roomCode]) {
  //     playersReady[roomCode] = [];
  //   }
  //   playersReady[roomCode].push(socket.id);

  //   if (playersReady[roomCode].length === 2) {
  //     const duration = 60000; // Example: 1-minute timer
  //     const startTime = Date.now(); // Get current timestamp

  //     io.to(playersReady[roomCode][0]).emit('startTimer', { duration, startTime });
  //     io.to(playersReady[roomCode][1]).emit('startTimer', { duration, startTime });

  //     delete playersReady[roomCode];
  //   }
  // });

  io.emit('updatePlayers', backEndPlayers);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
