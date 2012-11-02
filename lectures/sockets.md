
# Sockets


## Simple TCP Sockets

*In this section we will create a simple socket server that we can connect to over a TCP connection.  
This is a precursor to web-sockets, but with less in the way (ie: browser, client-side-libs, http-server)*

[TCP server gist](https://gist.github.com/3897499)


## Socket.IO

### Server-Side

First, create a package.json with the following then run an "npm install" to get our npm dependencies.

```JavaScript
{
  "name": "nodelabs-socket.io",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "node app"
  },
  "dependencies": {
    "express": "3.0.0rc5",
    "socket.io": "*"
  }
}
```

#### Simple express.js server for client-side assets

Since socket.io is used for web-sockets, we will be consuming socket end-points with client-side HTML/JavaScript.

For this we will use a socket.io in conjunction with express.js.  We'll also use a JavaScript object-literal as our dummy data-store.  And finally because we're friendly JS developers, we'll add a few extra variables we will use later on in our file.  This makes global variables quickly recognizable and keeps all instantiation of 'var' in one area (and it looks pretty).

The express.js configuration below is very minimal and will be capable of serving HTML, JavaScript or anything else in the directory we provide to our express.static() method.  Instead of providing a port number to the http.createServer method, we'll provide the express app to bind the server to and we'll expect the server to start on 3000, or if you have a PORT environment variable set it will be used instead.

```JavaScript
// Dependencies
  var express = require('express'),
      io = require('socket.io'),
      http = require('http'),
      users = {
        "joeandaverde": { "name": "joseph",   "id": "joeandaverde" }, 
        "mhemesath":    { "name": "mike",     "id": "mhemesath" }, 
        "dustyburwell": { "name": "dusty",    "id": "dustyburwell" }, 
        "ruzz311":      { "name": "russell",  "id": "ruzz311" }, 
        "joelongstreet":{ "name": "joe",      "id": "joelongstreet" }, 
        "adunkman":     { "name": "andrew",   "id": "adunkman" }
      },
      app, server;

// Express Setup 
  app = express();
  app.use(express.static( __dirname+"/public" ));
  server = http.createServer(app);
  server.listen( process.env.PORT || 3000);
```

#### Socket.io Setup

First we must tell socket.io to bind to the server we just created (or to a port if we are not using express.js), which allows us to connect to our socket server in the browser.

```JavaScript 
// Socket.io 
  io = io.listen(server);
  
  io.sockets.on('connection', function (client) {
    client.emit('connection.me'); 
    
    // system event emitters / listeners
    client.broadcast.emit('connection.join');
    client.on('disconnect', function () { 
      client.broadcast.emit('connection.drop') 
    });
    
  });
```

Now the fun part: creating the RPC endpoints to manipulate our "users-database".

First, we bind the server to a "connection" event which is triggered any time a new user connects to our socket-server.  These connections are only connections to the socket server, and not to any assets being hosted via the express.js static method we wrote above.

The second argument is a callback which is triggered after a user is connected and exposes a variable which we are calling "client".  Client is a variable which is unique to each connection and can be used to send messages back to a single client, rather than to all sockets connected.

Let's briefly cover how these different method calls work with the connected clients. Below, we are emitting a custom event and our unique connection ID that we will listen for later when we move to the client-side.  No one other than the client making the connection will get this event.

```JavaScript 
  client.emit('connection.me', client.id); 
```

This event will be used much like jQuery's DOM-Ready function; it will help us know when our connection
is ready to receive data.  It's also helpful if changes are made while the user's connection is 
dropped and they rejoin.  We can then pull updates and merge the changes that happened while we were
missing.

```JavaScript
  client.broadcast.emit('connection.join');
  client.on('disconnect', function () { 
    client.broadcast.emit('connection.drop') 
  });
```
Using the broadcast.emit() method is sent to all connections except for the client making the broadcast.  Finally, we're binding the client to a disconnect event which is sent out to all connections.  In our example we're not really doing much with other clients but it does illustrate the number of ways to have clients in a system interact.

There is one other emit method which is not covered above, but gives the ability to message all connected clients including the client initiating the event.  To use this method, emit using the *io.sockets* object:

```JavaScript
  io.sockets.emit("all clients including me!")
```

#### Socket.io resource responders

Let's bind some events to our client socket so we can start making socket connections.

```JavaScript
  io = sio.listen(server);
  
  io.sockets.on('connection', function (client) {
    // create a new resource from the user object
    client.on('user.create', function (user, cb) {});
    
    // read a single resource - if id is null, return all
    client.on('user.read', function (id, cb) {});
    
    // update an existing resource
    client.on('user.update', function (user, cb) {});
    
    // destroy a resource
    client.on('user.destroy', function (id, cb) {});
    
    // system
    client.emit('connection.me', client.id); 
    client.broadcast.emit('connection.join');
    client.on('disconnect', function () { 
      client.broadcast.emit('connection.drop') 
    });
    
  });
```

#### Create a user resource

We will use the create route as an example of how to set up your other routes.  While we haven't covered how to make this call yet from the client side, imagine the first argument ('user.create') is a url and the function arguments are query parameters.  The awesome part about sockets is our query parameters can be just about anything (*hint: always sanitize user input, this goes for every technology*).

```JavaScript
  client.on('user.create', function (user, cb) {
    if (users[user.id]) {
      cb("ERROR: user exists", null);
    } else {
      users[user.id] = user;
      cb(null, user);
      io.sockets.emit('user.created', user);
    }
  });
```

The arguments provided in the function are passed from the front end and consist of a user object to be created and a callback.  Passing a callback in this manor is often referred to as an acknowledgment since the client is expecting specific arguments to check if the operation was successful.

After checking if the user already exists, we provide the callback with 2 arguments, where in a successful transaction we expect the first argument to be null and the second argument to contain our payload.  On the other hand, if there is any value provided in the first argument the client will assume the transaction has failed and will use the first argument to determine the appropriate actions.  The second value at this point is trivial since our user data-store did not save anything.

If we've succeeded the example above is being a bit redundant as it is providing both an acknowledgment and emitting an event to all users.  We'll cover why in the client-side code shortly, but for now we see that we are finally returning something useful for our connected clients to consume.

### Client-Side

#### Create index.html

Below is the html file.  Don't get too hung up on the markup or the inline javascript.  Templating isn't our main concern here, but it's nice to see the DOM update with our changes when other clients CRUD some users.

**NOTE: You only need to create the '/public/jquery.js' and "/public/client.js" files listed at the bottom of the body tag.  The socket.io.js file is automatically generated for you when calling the sio.listen() call above and is part of the socket.io library.**

```HTML
<!DOCTYPE html>
<html>
  
  <head>
    <title>NodeLabs Socket.io</title>
    <style>
      body { padding: 50px; font: 14px "Lucida Grande", Helvetica, Arial, sans-serif; } 
      a { color: #00b7ff; }
    </style>
  </head>
  
  <body>
    <h1>NodeLabs Socket.io Lab</h1>
    <p>The purpose of this lab is to code simple api to a server resource that may be shared across multiple clients.</p>
    <p>Open your favorite browser, open the console and type 'Users' into the console to view the User api.</p>
    
    <h3 id="count"></h3>
    <ul id="users"></ul>
    
    <script>
      // View helpers / non-essential
      var updateView = function () {
        var list = [];
        
        for (var u in collection) {
          if (!collection.hasOwnProperty(u))
            continue;
          list.push('<li>'+collection[u].id+' ('+collection[u].name+')</li>');
        }
        
        $('#users').html(list.join(''))
        $('#count').html("Users ("+list.length+")");
      }
    </script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="/jquery.js"></script>
    <script src="/client.js"></script>
  </body>
  
</html>
```