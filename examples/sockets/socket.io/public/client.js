var socket = io.connect('http://localhost:3000'),
    collection = [], 
    User;


//==================== User resource emitters (events / data sent to the server)

  User = (function(){
    
    var _common = function (action, user, cb) {
      socket.emit(action, user, function (err, res) {
        if (err)
          console.log(err, action, res);
        
        if (typeof cb === "function") 
          cb(res);
      });
    };
    
    return {
      read : function (id, cb) {
        socket.emit('user.read', id, function(err, res){
          if (err){
            console.log(err, res);
            return false;
          }
          
          if (id)
            collection[id] = res
          else
            collection = res;
          
          if (typeof cb === "function") cb(res);
        });
      },
      create  : function (user, cb) { _common('user.create', user, cb) },
      update  : function (user, cb) { _common('user.update', user, cb) },
      destroy : function (user, cb) { _common('user.destroy', user, cb) }
    }
  })();


//==================== User resource listeners (listen for socket server events)

  // Socket connection events from the server
  socket.on('connection.me', function(){ User.read(null, updateView) });
  socket.on('connection.join', function () { console.log("Connection.join") });
  socket.on('connection.drop', function () { console.log("Connection.drop") });

  // User resource listeners (events emitted from the server)
  socket.on('user.created', function (user) {
    collection[user.github] = user;
    updateView();
  });

  socket.on('user.updated', function (user) {
    collection[user.github] = user;
    updateView();
  });

  socket.on('user.destroyed', function (userid) {
    delete collection[userid];
    updateView();
  });


//========================================================================= Init
  

  /*
  User.read('ruzz311', function(d){ console.log('yay', d) });
  User.create({ 
    "github": "repbl4lyfe", 
    "name": "mitt romney" 
  });
  User.update({ 
    "github": "ruzz311", 
    "name": "russell madsen" 
  });
  */
