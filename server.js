// server.js — simple express + socket.io server with static file serving
const express = require('express');
const app = express();
const http = require('http').createServer(app);

// socket.io v2 compatible init (matching client lib)
const io = require('socket.io')(http, {
  allowEIO3: true
});

// serve static files from project root (this lets /chat-bg.png load)
app.use(express.static(__dirname));

// route endpoints
app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});
app.get('/giphyCall', (req, res) => {
  res.sendFile(__dirname + '/giphyCall.html');
});

// Simple in-memory presence store (suitable for small 2-person app)
const presence = {}; // socketId -> { userId, lastSeen, typing }

io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('presence', (payload) => {
    presence[socket.id] = { userId: payload.userId || socket.id, lastSeen: Date.now(), typing: false };
    // broadcast simplified presence list
    io.emit('presence-update', Object.values(presence).map(p => ({ userId: p.userId, typing: p.typing })));
  });

  socket.on('typing', (isTyping) => {
    if(!presence[socket.id]) presence[socket.id] = { userId: socket.id, lastSeen: Date.now(), typing: !!isTyping };
    presence[socket.id].typing = !!isTyping;
    presence[socket.id].lastSeen = Date.now();
    io.emit('presence-update', Object.values(presence).map(p => ({ userId: p.userId, typing: p.typing })));
  });

  socket.on('pheonix-message', (message) => {
    // broadcast message to others (and keep original behavior)
    console.log('message', message);
    socket.broadcast.emit('pheonix-message', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
    delete presence[socket.id];
    io.emit('presence-update', Object.values(presence).map(p => ({ userId: p.userId, typing: p.typing })));
  });
});

// start server
const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log('listening on *:' + port);
});
