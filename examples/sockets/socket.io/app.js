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
  users = {
    "joeandaverde": { name: "joseph",   github: "joeandaverde" }, 
    "mhemesath":    { name: "mike",     github: "mhemesath" }, 
    "dustyburwell": { name: "dusty",    github: "dustyburwell" }, 
    "ruzz311":      { name: "russell",  github: "ruzz311" }, 
    "joelongstreet":{ name: "joe",      github: "joelongstreet" }, 
    "adunkman":     { name: "andrew",   github: "adunkman" }
  };
  
  io = io.listen(server);
  
  io.sockets.on('connection', function (client) {
    
    // resource create
    client.on('user.create', function (user, cb) {
      if (users[user.github]) {
        cb("ERROR: user already exists", null);
      } else {
        users[user.github] = user;
        cb(null, user);
        io.sockets.emit('user.created', user);
      }
    });
    
    // resource read
    client.on('user.read', function (id, cb) {
      if (id){
        err = (users[id]) ? null : "ERROR: no user found with id = "+id;
        cb(err, users[id]);
      }
      cb(null, users);
    });
    
    // resource update
    client.on('user.update', function (user, cb) {
      if (typeof users[user.github] === "undefined") {
        users[user.github] = user;
      }
      cb(null, user);
      io.sockets.emit('user.updated', user);
    });
    
    // resource destroy
    client.on('user.destroy', function (id, cb) {
      if (typeof users[id] === "undefined") {
        
      } else {
        
      }
      var deletedUser = users[id];
      delete users[id];
      cb(null, deletedUser);
      io.sockets.emit('user.destroyed', deletedUser);
    });
    
    // system event emitters/listeners
    io.sockets.emit('connection.join');
    
    client.on('disconnect', function () { 
      io.sockets.emit('connection.drop');
    });
    
  });
