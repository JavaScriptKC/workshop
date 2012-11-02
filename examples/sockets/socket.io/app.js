//================================================================= Dependencies

  var express = require('express'),
      sio = require('socket.io'),
      http = require('http'),
      users = require('./users.json'),
      app, server, io;
      

//================================================================ Express Setup

  app = express();
  app.use(express.static( __dirname+"/public" ));
  server = http.createServer(app);
  server.listen( process.env.PORT || 3000);


//=================================================================== Socket API
  
  io = sio.listen(server);
  
  io.sockets.on('connection', function (client) {
    
    // create resource
    client.on('user.create', function (user, cb) {
      if (users[user.id]) {
        cb("ERROR: user exists", null);
      } else {
        users[user.id] = user;
        cb(null, user);
        io.sockets.emit('user.created', user);
      }
    });
    
    // read resource(s)
    client.on('user.read', function (id, cb) {
      var result = id ? users[id] : users;
      if (typeof result === "undefined"){
        cb("ERROR: no user found with id = "+id)
      } else {
        cb(null, result);
        client.emit('user.listed', result);
      }
    });
    
    // update resource
    client.on('user.update', function (user, cb) {
      if (typeof users[user.id] === "undefined" ) {
        cb("ERROR: user not updated - user "+user.id+" does not exist", user);
      } else {
        users[user.id] = user;
        cb(null, user);
        io.sockets.emit('user.updated', user);
      }
    });
    
    // destroy resource
    client.on('user.destroy', function (id, cb) {
      if (typeof users[id] === "undefined") {
        cb("ERROR: user not destroyed - user with id = "+id+" does not exist", users[id]);
      } else {
        delete users[id];
        cb(null, id);
        io.sockets.emit('user.destroyed', id);
      }
    });
    
    // tell client when they've connected
    client.emit('connection.me', client.id); 
    
    // system event emitters / listeners
    client.broadcast.emit('connection.join');
    client.on('disconnect', function () { 
      client.broadcast.emit('connection.drop') 
    });
    
  });
