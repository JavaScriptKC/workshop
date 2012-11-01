var socket = io.connect('http://localhost:3000'),
    users = [], user;
  
// Users API (includes emmiters only)
user = {
  create : function(user){
    socket.emit('user.create', user, function(err, res){
      if(err)
        console.log('user create error', err, res);
    });
    return user;
  },
  
  read : function(id){
    socket.emit('user.read', id, function(err, res){
      if(err){
        console.log('user.read error', err, res);
        return false;
      } else {
        console.log('users!', err, res);
      }
    });
    return id;
  },
  
  update : function(user){
    socket.emit('user.update', user, function(err, res){
      if(err)
        console.log('user.update error', err, res);
    });
    return user;
  },
  
  destroy : function(user){
    socket.emit('user.delete', user, function(err, res){
      if(err)
        console.log('user.destroy error', err, res);
    });
    return user;
  }
};


$(function(){
  // get a list of users for reference
  user.read();
  
  // Socket events from the server
  socket.on('connection.join', function (data) {
    console.log("Connection.join", data)
  });
  socket.on('connection.drop', function (data) {
    console.log("Connection.drop", data)
  });
  
  // User socket listeners / emitters
  socket.on('user.created', function (data) {
    console.log('user.created', data);
    users.push(data);
  });
  socket.on('user.updated', function (data) {
    console.log('user.updated', data);
    users[data.id] = data;
  });
  socket.on('user.removed', function (data) {
    console.log('user.removed', data);
    users[data.id] = null;
  });
});
