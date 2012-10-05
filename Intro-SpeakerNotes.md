1. What I will discuss

1. What is Node.js?
   - JavaScript on the server
   - libuv + v8
   - Why javascript?
      - Event driven

1. What is node good at?
   - Async IO

1. What is node bad at?
   - CPU intensive apps

1. Show example of some JavaScript code w/o node modules (setTimeout example)
   - Describe how node process stays open while there's work to be done.
   - Show launching node process witha file and also no arguments for the REPL.

1. Create HTTP server example
   - Create in Node
   - Similar implementation in C#
   - res.end() is required to terminate connection (can be invoked in callback)

1. curl our webserver
   - Discuss headers

1. Modify web server to do setTimeout
   - curl and show response time also show in browser
   - curl with more than 1 terminal

1. Chat server example
   - Respond to connection and drop
   - Allow connection and broadcast

