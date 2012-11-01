
//================================================================= Dependencies

  var express = require('express'), 
      io = require('socket.io'), 
      http = require('http'),
      path = require('path'),
      users = [
        { name: 'joseph' }, 
        { name: 'mike' }, 
        { name: 'dusty' }, 
        { name: 'russell' }, 
        { name: 'joe' }, 
        { name: 'andrew' }
      ],
      app, server, io;

  app = express();
  server = http.createServer(app);


//================================================================ Express Setup
  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.directory(path.join(__dirname, 'public')));
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });
  
  server.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
  });


//================================================================= Socket Start
  
  io = io.listen(server);
  
  io.sockets.on('connection', function (client) {
    
    // resource event listeners
    client.on('user.create', function (user, cb) {
      users.push(user);
      cb(null, user);
      io.sockets.emit('user.created', { data: user });
    });
    
    client.on('user.read', function (id, cb) {
      if(id){
        console.log("id===null", id);
        cb(null, users[id]);
      }
      cb(null, users);
    });
    
    client.on('user.update', function (user, cb) {
      users[user.id] = user;
      cb(null, user);
      client.broadcast.emit('user.updated', { data: user });
    });
    
    client.on('user.destroy', function (user, cb) {
      cb(null, user);
      client.broadcast.emit('user.deleted', { data: user });
    });
    
    // system event emitters/listeners
    io.sockets.emit('connection.join');
    
    client.on('disconnect', function () { 
      client.broadcast.emit('connection.drop', { client: client });
    });
  });
