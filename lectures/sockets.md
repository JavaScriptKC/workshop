
# Sockets


## Simple TCP Sockets

*In this section we will create a simple socket server that we can connect to over a TCP connection.  
This will be a precursor to web-sockets, but with less in the way (ie: browser, client-side-libs, http-server)*

[TCP server gist](https://gist.github.com/3897499)


## Socket.IO

First, create a package.json with the following then run an "npm install" to get our npm 
dependencies.

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

### Simple express.js server for client-side assets

Since socket.io is used for web-sockets, we will be consuming socket end-points with client-side 
HTML/JavaScript.

For this we will use a socket.io in conjunction with express.js.  We'll also use a JavaScript 
object-literal as our dummy data-store.  And finally because we're friendly JS developers, we'll add 
a few extra variables we will use later on in our file.  This makes global variables quickly 
recognizable and keeps all instantiation of 'var' in one area (and it looks pretty).

The express.js configuration below is very minimal and will be capable of serving HTML, JavaScript 
or anything else in the directory we provide to our express.static() method.  Instead of providing a
port number to the http.createServer method, we'll provide the express app to bind the server to and
we'll expect the server to start on 3000, or if you have a PORT environment variable set it will be 
used instead.

```JavaScript
// Dependencies
  var express = require('express'),
      io = require('socket.io'),
      http = require('http'),
      users = { id:"ruzz311", name:"russell" },
      app, server;

// Express Setup 
  app = express();
  app.use(express.static( __dirname+"/public" ));
  server = http.createServer(app);
  server.listen( process.env.PORT || 3000);
```

### Socket.io skeleton

```JavaScript 
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