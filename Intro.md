# What makes node.js possible.

Node.js is a wrapper around Joyent's libuv and Google's V8 JavaScript engine. It provides a minimal approach to a framework for network communication. 

A major tenet of Node.js is that IO is performed asynchronously and there is no busy waiting. The asynchronous IO calls is made possible through libuv and the already familar syntax of callbacks in JavaScript. 

In the simplest of terms, when an IO call is made a callback is required to invoke after completion. Libuv handles the scheduling and invocation of these callbacks through what's called the event loop. The event loop is the driving force behind why Node.js is considered asynchronous. Any time computation must wait for a slow network connection or hard disk a callback is placed in this event loop and execution is resumed in the JavaScript application. 

#Example of using node as a HTTP server

```JavaScript
var http = require('http');

var server = http.createServer(function httpCallback(req, res) {
	res.writeHead(200);
	res.write("Hello world!");
	res.end()
});

server.listen(8000);
```

This simple example illustrates how node can be used to create an HTTP server that responds to all requests with "Hello world!" It's important to note that the call to ```server.listen(8000)``` essentially registers the ```httpCallback``` function with the libuv event loop. When an HTTP request is received, libuv and ultimately Node invokes the callback. 

```
> curl http://127.0.0.1:8000 -i
HTTP/1.1 200 OK
Date: Fri, 28 Sep 2012 03:42:52 GMT
Connection: keep-alive
Transfer-Encoding: chunked
```

There are two important headers to consider. First, is ```Connection: keep-alive``` that allows for the connection to the server to be maintained between subsequent requests. This removes the overhead of the TCP negotion that would otherwise need to occur on every request. Secondly, ```Transfer-encoding: chunked`` allows for the Node server to respond with a variable length response. These two headers gives Node the ability to stream data in the response as it becomes ready. For example, waiting on the database to return a result set or reading a file off the disk.

```JavaScript
var http = require('http');

function queryDatabase(callback) {
	setTimeout(callback, 3000); //3 seconds
}

var server = http.createServer(function (req, res) {
	res.writeHead(200);

	queryDatabase(function () {
		res.write("Hello World!");	
		res.end();
	});
});

server.listen(8000);
```

In this example when a request is made to the server a long running database query is invoked. When this query finishes (in 3 seconds) a callback is invoked and the response to the client is finished. While the the first client is waiting for the operation to complete subsequent clients can still connect. We can test this behavior by opening multiple shells and making simultaneous requests. A timeout of three seconds was chosen to help visualize the non-blocking behavior.

```
> curl http://localhost:8000
3000 milliseconds later...
Hello World!
```

Also worth noting is that ```res.end()``` is called inside the callback. This is why the connection is still open and can still receive "Hello world!" several seconds later. 

An example of a process that would be considered a gross misuse of node could be something like this:

```JavaScript
var http = require('http');

var server = http.createServer(function (req, res) {
	res.writeHead(200);

	while(true) { 
	}
	
	res.write("Hello World!");	
	res.end();

});

server.listen(8000);
```

In this example Node is 100% busy serving the first request forever. Node does not operate with a threaded model. It's only ever doing one thing at a time in JavaScript. This is why performing computationally expensive operations is not a good use of Node. However, that's not to say that you cannot do CPU bound operations with Node. There are benchmarks showing the performance of JavaScript in V8 on the heels of equivelant C++ code.

#When should you use node?

Any time you are creating an application that demands a high number of concurrent connections that don't need a lot of time on the CPU. Node is especially good at handling these concurrent connections because of its evented philosophy. 

Let's go back a few examples where our HTTP server is working hard for several seconds and then writes "Hello World!" to the response. Apache bench will allow us to simulate 100 concurrent connections and provide statistics about the response time.

```ab -n 100 -c 100 http://127.0.0.1```

Note that the overall time for 100 concurrent connections to complete is roughly three seconds. Let's try it with 1000 concurrent connections. However, because of consumer OS limitations we must increase the number of ports that can be open on our machines. *Code to increase ulimit*

```ab -n 1000 -c 1000 http://127.0.0.1```

# Lets dig into the node process with the node REPL

When the node process is run without arguments you are presented with a REPL (Read Evaluate Print Loop). The full power of V8 and node is available through this interface. You can execute multi-line statements and inspect variables. This is similar to the JavaScript console that's available in many web browsers. 

Node has made an attempt to be consistent with many browser conventions. An example of this consistency is the implementation of setTimeout. This function wraps a native call in both browsers and Node to invoke a callback after a specifed number of milliseconds. This is not provided by V8 out of the box. As a matter of fact, V8 only provides the JavaScript execution engine. One similarity to the browser that Node provides is a global object that has information about the environment. In browsers this object is named 'window' and in Node it's named 'process'. These objects whether in the browser or in node serve a similar purpose. 

```
> node
> process.pid
1408
> process.env
{ PATH: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin',
  SHELL: '/bin/zsh',
  HOME: '/Users/joe',
  USER: 'joe',
  ... 
}	
```

Let's do something more complicated. Let's actually create our HTTP server through the REPL. It's as easy as copy and paste of a previous snippet to get it working.

# A simple chat server

A chat server requires a persistent connection instead of a request/response mechanism like HTTP. This requires the use of a different module called 'net' which is really TCP. TCP will allow us to keep connections i.e. sockets open and duplex data between the client and server.

```JavaScript
var net = require('net');

var server = net.createServer(function (socket) {
	socket.write('hello world\n');
	socket.end();
});

server.listen(8080);
```

Connect to this and you'll be greeted with a nice message and your connection will end immediately. In order to actually create a chat server we need to know who's connected and notify them of new messages. Obviously this also requires accepting messages and broadcasting them to connected clients. Let's try and do that.

Our first modification is to keep a list of open connections and allow the connection to stay open.

```JavaScript
var net = require('net');

var clients = [];

var server = net.createServer(function (socket) {
	clients.push(socket);
	
	socket.on('end', function () {
		var index = clients.indexOf(socket);
		delete clients[index];
	});
});

server.listen(8080);
```

Now that we have an updating list of connected clients we can start accepting and broadcasting messages. Let's also be mindful that we don't want to echo messages we've sent back to ourselves.

```JavaScript
var net = require('net');

var clients = [];

var server = net.createServer(function (socket) {
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





