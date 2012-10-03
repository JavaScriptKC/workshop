var Stream = require('stream');
var net = require('net');
var stdin = process.openStdin();

var broadCastStream = new Stream();
broadCastStream.writable = true;

var peers = {};
var events = {};
var dataStore = {};
var myPort = process.argv[2];

broadCastStream.write = function (data) {
	var result = JSON.parse(data.toString());

	if (!events[result.id]) {

		events[result.id] = data;
		dataStore[result.key] = result.value;
	
		for (p in peers) {
			if (result.source === p) {
				continue;
			}
			
			peers[p].write(data);
		}
	}
};

var commands = {
	'data': function () {
		console.log(dataStore);
	}, 
	'me': function () {
		console.log(myPort);
	},
	'events': function () {
		console.log(Object.keys(events));
	},
	'peers': function () {
		console.log(Object.keys(peers));
	},
	'save': function (data) {
		broadCastStream.write(new Buffer(JSON.stringify(data)));	
	}
}

stdin.on('data', function (data) {
	var input = data.toString().trim();
	var matches = input.match(/(\w+)=(.*)/);
	
	if (matches) {
		commands.save({ source: myPort, id: new Date().getTime(), key: matches[1], value: matches[2] });
	}
	else if (commands[input]) {
		commands[input]();
	}
});

var connect = function (others) {
	others.forEach(function (o) {
		if (peers[o] || o === myPort) {
			return;
		}

		var socket = peers[o] = net.connect(o);

		socket.once('data', function (data) {
			var result = JSON.parse(data);
			socket.write(JSON.stringify({ port: myPort, peers: Object.keys(peers) }));			
			dataStore = result.data;
			connect(result.peers);
			socket.pipe(broadCastStream, {end: false});
		});	

		function cleanup () {
			delete peers[o];

			socket.removeListener('error', cleanup);
			socket.removeListener('end', cleanup);
		}
		
		socket.on('error', cleanup);
		socket.on('end', cleanup);
	});
};

var server = net.createServer(function (socket) {
	var port;
	
	socket.write(JSON.stringify({ data: dataStore, peers: Object.keys(peers) }));

	socket.once('data', function (data) {
		var result = JSON.parse(data);
		port = result.port;
		peers[port] = socket;
		connect(result.peers);

		socket.pipe(broadCastStream, {end: false});
	});

	socket.on('end', function () {
		if (port) {
			delete peers[port];
		}
	});
});

connect(process.argv.slice(3));

server.listen(myPort);