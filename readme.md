# Introduction
- What makes node possible. (v8, libuv)
- Why use node?
- When you shouldn't use node.
- The REPL
	- Show off the process global object
   - usefulness of the underscore 
- Running scripts with node
- Example of evented model
	- Compare to how other languages might handle waiting on a response from the network or db. Highlight that node is idle while waiting for callback and frees up other event handlers to do work.
	- The program exits when no more callbacks!
- Simple webserver
	- Hello world
	- Connection: keep-alive
	- Transfer-Encoding: chunked -> Allows for streaming (Show an example of how the streaming is possible in the request handler)
	- Show apache bench with -n 100 -c 100 to simulate 100 concurrent connections (show off the time it took)
- *Interactive Demo* create a simple chat server encourage others to connect

#Modules 
- Modules should comply with CommonJS
- require() wraps in a closure that has access to module.export

```JavaScript
var module = { exports: { } };

(function (module, exports) {
   
   //Your module code here

})(module, module.exports);

```

- Module cache - Modules are cached by the resolved file name. Modules are only executed once so as long as the resolved filename is the same the exact same object will be returned. For example, a module loading another module in the node_modules directory will return a different object. 

#NPM
- Define package managers compare to other platforms
- Before Node.JS there was... nothing.
- Deploys with Node.js
- Not limited to JavaScript packages. Can build and deploy binaries.
- packages.json
- local vs global node modules
- Build something and publish with NPM?
- How NPM handles different versions of the same 
- The star for the most recent version
- The tilde for versions to help resolve dependencies using symver
- Useful NPM commands besides install
  - init
  - docs
  - link
  - search
  - test

#Node Core
- Event Emitters
- Buffer
  - Stored outside of v8 memory.
  - Used in streams
- Streams
- Show an example of issuing an http request and putting the response into a data variable. Describe how this is often a misuse of streams because it's buffering data in memory instead of piping it along.
- Show an example of piping data from an input stream to an output.
- Streams are EventEmitters with specific events  (Readable: data, end, error, close Writeable: drain, error, close, pipe)
- File System
- Child Process
- Domains?

#Express App
- 
- File Uploads

#WebSockets

#Debugging

#Real Time Projects with Node (Volunteer speakers)


#Lab Ideas
- Create a shell 
- Create an express app
- MongoDB / Couch database 