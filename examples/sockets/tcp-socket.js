var net = require('net'), server, s;

// socket events
socket = {
  
  // server start event
  onStart: function(){ 
    console.log('server started') 
  },
  
  // handle new connections
  onClientConnect: function(conn){
    console.log('connected', conn);
    conn.on('end', socket.onClientEnd);
    conn.on('data', socket.onClientData);
    conn.write('client connected to server\r\n');
    conn.pipe(conn);
  },
  
  onClientData: function(buf){ 
    var str   = buf.toString('utf8'),
        bytes = Buffer.byteLength(str, 'utf8'),
        len   = buf.length;
    console.log('client -> server data is %s characters and %s bytes long.', len, bytes);
    console.log('client -> server raw data: ', buf);
    console.log('client -> server message: "%s"', str);
  },
  
  // client disconnect event
  onClientEnd: function(){ 
    console.log('disconnected') 
  }
};

// Create & Start 
server = net.createServer(socket.onClientConnect);
server.listen(3333, socket.onStart);

/** (assumed *nix based OS)
  *
  * Start socket server 
  *   -> $ node sockets-1.0.js)
  *
  * telnet into your server you just started.  you should see "What up NodeLabs KC?"
  *   -> $ telnet 127.0.0.1 3333
  *
  * At this point you are in a telnet session with your TCP server.
  * You can send messages to the server by entering message and press enter.
  *   -> $ "Mr. Watson - come here - I want to see you." <return>
  *
  * To exit telnet, press "control"+"]" and type "quit"
**/