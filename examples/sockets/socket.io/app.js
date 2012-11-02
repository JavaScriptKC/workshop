//================================================================= Dependencies

  var express = require('express'),
      io = require('socket.io'),
      http = require('http'),
      path = require('path'),
      users = require('./users.json'),
      app, server, io;
      

//================================================================ Express Setup

  app = express();
  app.set("port", process.env.PORT || 3000);
  app.use(express.static( path.join(__dirname, "public") ));
  
  server = http.createServer(app);
  server.listen(app.get("port"));


//=============================================================== Socket RPC API
  
  io = io.listen(server);
  
  io.sockets.on('connection', function (client) {
    
    // resource create
    client.on('user.create', function (user, cb) {
      if (users[user.github]) {
        cb("ERROR: user exists", null);
      } else {
        users[user.github] = user;
        cb(null, user);
        io.sockets.emit('user.created', user);
      }
    });
    
    // resource read
    client.on('user.read', function (id, cb) {
      var err = null,
          result = id ? users[id] : users;
      if (typeof result === "undefined")
        err = "ERROR: no user found with id = "+id;
      cb(err, result);
    });
    
    // resource update
    client.on('user.update', function (user, cb) {
      if (typeof users[user.github] === "undefined" ) {
        cb("ERROR: user not updated - user "+user.github+" does not exist", user);
      } else {
        users[user.github] = user;
        cb(null, user);
        io.sockets.emit('user.updated', user);
      }
    });
    
    // resource destroy
    client.on('user.destroy', function (id, cb) {
      if (typeof users[id] === "undefined") {
        cb("ERROR: user not destroyed - user with github = "+id+" does not exist", users[id]);
      } else {
        delete users[id];
        cb(null, id);
        io.sockets.emit('user.destroyed', id);
      }
    });
    
    // system event emitters/listeners
    client.emit('connection.me');  // sent only to me
    client.broadcast.emit('connection.join'); // sent to everyone except me
    client.on('disconnect', function () { 
      socket.broadcast.emit('connection.drop');
    });
    
  });
