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
          cb(err, res);
      });
    };
    
    return {
      read    : function (user, cb) { _common('user.read', user, cb) },
      create  : function (user, cb) { _common('user.create', user, cb) },
      update  : function (user, cb) { _common('user.update', user, cb) },
      destroy : function (user, cb) { _common('user.destroy', user, cb) }
    }
  })();


//==================== User resource listeners (listen for socket server events)

  // User resource listeners (events emitted from the server)
  socket.on('user.listed', function (user) {
    if (user.id)
      collection[user.id] = user
    else
      collection = user;
    updateView();
  });
  
  socket.on('user.created', function (user) {
    collection[user.id] = user;
    updateView();
  });

  socket.on('user.updated', function (user) {
    collection[user.id] = user;
    updateView();
  });

  socket.on('user.destroyed', function (userid) {
    delete collection[userid];
    updateView();
  });


//========================================================================= Init
  
  // Socket connection events from the server
  socket.on('connection.me',   function () { User.read(null, updateView) });
  socket.on('connection.join', function () { console.log("Connection.join") });
  socket.on('connection.drop', function () { console.log("Connection.drop") });
  
  /*
  User.read('ruzz311', function(err, user){ console.log('yay', user) });
  User.create({ 
    "id": "repbl4lyfe", 
    "name": "mitt romney" 
  });
  User.update({ 
    "id": "ruzz311", 
    "name": "russell madsen" 
  });
  */
