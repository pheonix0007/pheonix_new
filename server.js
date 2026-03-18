var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  allowEIO3: true // false by default
});

app.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/chat.html');
});

app.get('/giphyCall', (req, res) => {
  res.sendFile(__dirname + '/giphyCall.html');
});

io.on('connection', (socket) => {
  console.log('User Online');
  
  socket.on('pheonix-message', (msg) => {
    console.log('message:');
	socket.broadcast.emit('message-from-others', msg);
  });
  
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 3000;
http.listen(server_port, () => {
  console.log('listening on *:' + server_port);
});
