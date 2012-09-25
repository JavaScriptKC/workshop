# What makes node.js possible.

Node.js is a wrapper around Joyent's libuv and Google's V8 JavaScript engine. It provides a minimal approach to a framework for network communication. 

A major tenet of Node.js is that IO is performed asynchronously and there is no busy waiting. The asynchronous IO calls is made possible through libuv and the already familar syntax of callbacks in JavaScript. 

In the simplest of terms, when an IO call is made a callback is required to invoke after completion. Libuv handles the scheduling and invocation of these callbacks through what's called the event loop. The event loop is the driving force behind why Node.js is considered asynchronous. Any time computation must wait for a slow network connection or hard disk a callback is placed in this event loop and execution is resumed in the JavaScript application. 

#Example of using node as a HTTP server

```
var http = require('http');

var server = http.createServer(function (req, res) {
	res.writeHead(200);
	res.write("Hello world!");
	res.end()
});

server.listen(8000);
```

This simple example illustrates how node can be used to create an HTTP server that responds to all requests with "Hello world!" It's important to note that the call to server.listen essentially registers the callback to createServer in the libuv event loop. When an HTTP request is received libuv and ultimately Node core invokes the callback. 

*Show headers of the HTTP response*
There are two important headers to consider. First, is that Keep-Alive allows for the connection to the server to be maintained between subsequent requests. Secondly, the transfer-encoding: chunked allows for the Node process to send a variable length response. These two headers gives node the ability to stream data in the response as it's ready. For example, waiting on the database to return a result set or reading a file off the disk.

```
var http = require('http');

var server = http.createServer(function (req, res) {
	res.writeHead(200);
	//Simulate something that takes a long time
	setTimeout(function () {
		res.write("Hello world!");	
		res.end();
	}, 2000)
});

server.listen(8000);
```
curl http://localhost:8000

The first thing to notice in this example is that the function invocation ends as soon as setTimeout returns. The callback provided to setTimeout is invoked some time later. This might simulate a request to another service or file system or anything that takes a computationaly significant amount of time. 

Also worth noting is that res.end() is called inside the callback. This is why the connection is still open and can still receive "Hello world!" two seconds later. 

#When should you use node?

Any time you are creating an application that demands a high number of concurrent connections. Node is especially good at handling these concurrent connections because of its evented philosophy. 

Let's go back to our last example where our HTTP server is working hard for two seconds and then ends the response. Apache bench will allow us to simulate 100 concurrent connections and provide statistics about the response time.

ab -n 100 -c 100 http://127.0.0.1

Note that the overall time for 100 concurrent connections to complete is roughly two seconds. Let's try it with 1000 concurrent connections. However, because of consumer OS limitations we must increase the number of ports that can be open on our machines. *Code to increase ulimit*

ab -n 1000 -c 1000 http://127.0.0.1

# Lets dig into the node process with the node REPL

When the node process is run without arguments a REPL is provided. The full power of V8 and node is available through this interface. You can execute multi-line statements and inspect variables. This is similar to the console that's available in many web browsers. Node has made an attempt to be consistent with many browser conventions. An example of this consistency is the implementation of setTimeout. This function wraps a native call in both browsers and in this case node to invoke a callback at a later time. This is not provided by V8 out of the box. As a matter of fact V8 only provides the JavaScript virtual environment. One similarity to the browser that node provides is a global object that has information about the environment. In browsers this object is named 'window', however, in node it's called 'process'. These objects whether in the browser or in node serve a similar purpose. 

`` 
process.env

process.pid

``

Let's do something more complicated. Let's actually create our HTTP server through the REPL. It's as easy as copy and paste of the previous snippet to get it working.

*Copy and paste snippet in the REPL*
*Invoke the web site*

# A simple chat server

```
var net = require('net');

var server = net.server(function (socket) {
	socket.write('hello world');
	socket.end();
});

server.listen(8080);
```

Connect to this and you'll be greeted with a nice message and your connection will end immediately. In order to actually create a chat server we need to know who's connected and notify them of new messages. Obviously this also requires accepting messages and broadcasting them to connected clients. Let's try and do that.

Our first modification is to keep a list of open connections and allow the connection to stay open.

```
var net = require('net');

var clients = [];

var server = net.server(function (socket) {
	clients.push(socket);
	
	socket.on('end', function () {
		delete clients[socket];
	});
});

server.listen(8080);
```

Now that we have an updating list of connected clients we can start accepting and broadcasting messages. Let's also be mindful that we don't want to echo messages we've sent back to ourselves.

```
var net = require('net');

var clients = [];

var server = net.server(function (socket) {
	clients.push(socket);
	
	socket.on('data', function (data) {
		for (var i = 0; i < clients.length; i++)
		{
			var client = clients[i];
			
			//Don't echo our messages
			if (client === socket)
				continue;
			
			client.write(data);
		}
	});
	
	socket.on('end', function () {
		var index = clients.indexOf(socket);
		delete clients[index];
	});
});

server.listen(8080);
```





