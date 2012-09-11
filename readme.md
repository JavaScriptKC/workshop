# Beginner's Workshop for Node.js

```
NOTE: This is a working draft. Please pull request changes. The outline is 
particularly weak near the end.
```

## Friday: Workstation setup 

- Introduction to the group and the workshop
- Introduction to the command line on Windows, Mac OS X, or Linux
- Self guided tutorial to setup nodejs and intro to javascript as a calculator in the REPL
  and running a .js file with node

The self guided tutorial will be provided before the setup night for those who cannot
attend or want to get started early.

## Saturday: Workshop
Bring a laptop, lunch will be provided.

- Introduction to writing JavaScript
  - Variables
  - Native types
  - Arrays
  - Operators
  - Flow control structures (if & else, while, for, for... in)
  - Advanced control structures (switch, ternary operator)
  - Console.log
- Entering the REPL with the `node` command
- Executing code files with `node`
- *Recitation:* Simple programming project to demonstrate skills taught
  - Mathematics examples 
    - Simple addition and multiplication examples printed to stdout (exercise order of operations and parens?)
    - Sum of all odd numbers from 1 to 100
    - Calculating distance between two points
  - Substituting characters of a string with the 1337 speak equivelant eg. street -> 57r337
- Hand out Saturday's schedule

- Brief history of JavaScript
- Writing intermediate JavaScript
  - Functions
  - Objects
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
