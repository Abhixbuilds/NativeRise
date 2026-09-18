const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join user room & role room
    socket.on('join', ({ userId, role }) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
      if (role) {
        socket.join(`role:${role}`);
      }
    });

    socket.on('leave', ({ userId, role }) => {
      if (userId) socket.leave(`user:${userId}`);
      if (role) socket.leave(`role:${role}`);
    });

    socket.on('disconnect', () => {
      // Disconnected cleanly
    });
  });

  return io;
};

const getIo = () => {
  return io;
};

// Helper notification dispatcher
const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io && role) {
    io.to(`role:${role}`).emit(event, data);
  }
};

const broadcastEvent = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

module.exports = { initSocket, getIo, emitToUser, emitToRole, broadcastEvent };
