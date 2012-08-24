# Beginner's Workshop for Node.js

## Friday: Workstation setup 

- While people are arriving: install Node.js

- Introduction to the command line on Windows, Mac OS X, or Linux
- Introduction to writing JavaScript
  - Variables
  - Native types
  - Operators
  - Flow control structures (if & else, while, for, for... in)
  - Advanced control structures (switch, ternary operator)
- Entering the REPL with the `node` command
- Execuing code files with `node`
- *Recitation:* Simple programming project to demonstrate skills taught
- Hand out Saturday's schedule

## Saturday: Workshop
Bring a laptop, lunch will be provided.

- Brief history of JavaScript
- Writing intermediate JavaScript
  - Functions
  - Variable scoping and closures
- Events
  - Callbacks
  - EventEmitters
- Concurrency
- Reading and writing the console
- *Recitation:* Capturing keyboard input
  - Events: `process.stdin.on('data', function () {});`
  - Concurrency: setTimeout(function () {});
- `require()`ing packages
- Reading and writing files with the `fs` package
- Reading a from the web with the `http` package
- *Recitation:* Downloading a file
  - Uses `http` to fetch a file
  - `.on('data', function () {});` uses `fs`
- Hosting a web service with `http`
- Simplifying web hosting with `express`
- *Recitation:* Create a web server

- Main track splits into a number of breakout topics:
  - Deploying (the app just written) to Heroku
  - Writing proper JavaScript
  - And some other ones that you should think of
