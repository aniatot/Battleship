const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = new Map();

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('create_room', () => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms.set(roomId, { players: [socket.id], state: 'waiting' });
    socket.join(roomId);
    socket.emit('room_created', roomId);
    console.log(`[Room ${roomId}] created by ${socket.id}`);
  });

  socket.on('join_room', (roomId) => {
    roomId = roomId.toUpperCase();
    const room = rooms.get(roomId);
    
    if (room) {
      if (room.players.length < 2) {
        room.players.push(socket.id);
        room.state = 'playing';
        socket.join(roomId);
        socket.emit('room_joined', { roomId, isPlayer2: true });
        
        io.to(roomId).emit('game_start', {
          players: room.players,
          turn: room.players[0]
        });
        console.log(`[Room ${roomId}] joined by ${socket.id}. Game starts.`);
      } else {
        socket.emit('error_message', 'Room is full');
      }
    } else {
      socket.emit('error_message', 'Room not found');
    }
  });

  socket.on('ships_ready', (roomId) => {
     socket.to(roomId).emit('opponent_ready');
  });

  socket.on('attack', ({ roomId, target }) => {
    socket.to(roomId).emit('receive_attack', target);
  });

  socket.on('attack_result', ({ roomId, target, result, shipCoords }) => {
    socket.to(roomId).emit('attack_result_received', { target, result, shipCoords });
  });
  
  socket.on('change_turn', ({ roomId, nextPlayerId }) => {
    io.to(roomId).emit('turn_changed', nextPlayerId);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    for (const [roomId, room] of rooms.entries()) {
      if (room.players.includes(socket.id)) {
        socket.to(roomId).emit('opponent_disconnected');
        rooms.delete(roomId);
      }
    }
  });
});

// Use PORT from environment for cloud platforms like Render/Heroku
const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
