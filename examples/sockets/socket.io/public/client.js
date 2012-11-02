var socket = io.connect('http://localhost:3000'),
    collection = [], 
    User;


//==================== User resource emitters (events / data sent to the server)

  User = {
    create : function(user){
      socket.emit('user.create', user, function(err, res){
        if(err)
          console.log('user create error', err, res);
      });
    },
    
    read : function(id, cb){
      socket.emit('user.read', id, function(err, res){
        if(err)
          console.log(err)
        else if(id) 
          collection[id] = res
        else 
          collection = res
        
        if(typeof cb === "function")
          cb(res);
      });
    },
    
    update : function(user){
      socket.emit('user.update', user, function(err, res){
        if(err)
          console.log('user.update error', err, res);
      });
    },
    
    destroy : function(user){
      socket.emit('user.destroy', user, function(err, res){
        if(err)
          console.log('user.destroy error', err, res);
      });
    }
  };


//==================== User resource listeners (listen for socket server events)

  // Socket events from the server
  socket.on('connection.join', function () { console.log("Connection.join") });
  socket.on('connection.drop', function () { console.log("Connection.drop") });

  // User resource listeners (events emitted from the server)
  socket.on('user.created', function (user) {
    console.log('user.created', user);
    collection[user.github] = user;
    updateView();
  });

  socket.on('user.updated', function (user) {
    console.log('user.updated', user);
    collection[user.github] = user;
    updateView();
  });

  socket.on('user.destroyed', function (user) {
    console.log('user.destroyed', user);
    delete collection[user.github];
    updateView();
  });
  

//========================================================================= Init
  
  User.read(null, function(d){ 
    console.log('List of users obtained!', d) 
    updateView();
  });
  /*
  User.read(null, function(d){ console.log('sweet', d) });
  User.read('ruzz311', function(d){ console.log('double sweet', d) });
  User.create({ 
    "github": Math.floor((Math.random()*999)+1), 
    "name": "fake user" 
  })
  */
