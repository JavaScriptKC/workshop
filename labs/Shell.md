# A node Shell

In this lab we'll put together a simple shell. We'll interact with the filesystem and learn some useful facets of the JavaScript programming language.

Commands will be provided to our shell through the process' standard in. By default, node does not enable standard in. So the first thing we'll do is enable standard in and echo the commands.

Create a new file called shell.js and add the following:

```js
var stdin = process.openStdin();

stdin.on('data', function(input) {
   console.log(input);
});
```

Before we go any further, start up our echo process.

```node shell.js```

Type anything and press enter. Notice that the input is line buffered. To shut down the process press ```CTRL+C```.

Also, we're printing out a Buffer object. It's worth noting that, at this point, the buffer exists completely outside of the V8 heap. Interacting with this buffer will move data across the C++/JavaScript boundary. For example, calling .toString() will create a new JavaScript string containing the entire contents of the buffer. Since we're working with relatively short commands lets go ahead and call .toString() on the Buffer named ```input```.

Now starting up the shell again and typing input will result in the expected output including the new line character.

The next step is to parse the input string. The commands in our simple shell will take the form ```command [args...]```. A regex like this can separate the arguments from the command: ```/(\w+)(.*)/```. We can then parse the argument part of this by splitting each argument by white space.

```js
...
std.on('data', function (input) {
   var matches = input.toString().match(/(\w+)(.*/)/);
   var command = matches[1].toLowerCase();
   var args = matches[2].trim().split(/\s+/);
});
...
```

Feel free to check out the result of this by logging out the value of ```command``` and ```args```.


## Our first command: pwd

```pwd``` is a unix program to print out the current working directory. Let's implement this in our shell.

```js
var commands = {
   'pwd': function () {
      console.log(process.cwd());
   }
};

std.on('data', function (input) {
   var matches = input.toString().match(/(\w+)(.*/)/);
   var command = matches[1].toLowerCase();

   commands[command]();
});
```

Now, jump back to your terminal and give our shell a try!

```
node shell.js
pwd
/users/you/simple-shell/

```

## A parameterized command: ls

```ls [directory]```: prints the contents of a directory. If the directory argument is left out it will print the contents of the current working directory.

In order to process the arguments we need to add a little more parsing logic to the input. Since we split the command from the arguments with a regex we can now parse the second half of that string. Arguments are separated by white space so a simple regex split will give us what we need. In order to ignore unecessary white space let's trim the args string. We'll then pass this string array to our command function.

```js
...

std.on('data', function (input) {
   var matches = input.toString().match(/(\w+)(.*/)/);
   var command = matches[1].toLowerCase();
   var args = matches[2].trim().split(/\s+/);

   commands[command](args);
});
```

To implement ls add a new property to our object named 'ls' like this:

```js
...

var commands = {
   'pwd': function () {
      console.log(process.cwd());
   },
   'ls': function (args) {
      fs.readdir(args[0] || process.cwd(), function (err, entries) {
         entries.forEach(function (e) {
            console.log(e);
         });
      });
   }
};

...
```

Notice this part of the ls implementation: ```args[0] || process.cwd()``` 

Unlike many other languages, JavaScript doesn't care if you access an index out of bounds of an array. If an element does not exist ```undefined``` will be returned. Using the ```||``` syntax will test the existence of the return value of args[0] and if it doesn't exist will execute the next part of the statement: ```process.cwd()```. This is a common pattern for assigning a default value.

Feel free to implement your favorite shell command as an exercise or follow along with the next part of this lab where we'll implement ```tail```.

## Implementing tail

```tail [N]```: prints the last N lines of a file. This requires us to locate all of the newlines in a file and trim down to last N number of lines to print. If N is not specified we'll use 10 as the default.

Implementing this will give you exposure to file streams, getting formation about a file, and useful Array functions.

First, let's add the tail command to our commands object. After this point all examples will exclude the command object declaration.

```js
...

var commands = {
   'pwd': function () {
      console.log(process.cwd());
   },
   'ls': function (args) {
      //Implementation of ls here
   },
   'tail': function (args) {
      // Implemtation of tail here.
   };
};

...
```

First, pull in the ```fs``` module at the top of the file. ```fs``` is the node core module for file system operations.

```
var stdin = process.openStdin();
var fs = require('fs');

...
```

Get the length of the file in bytes. To do this we'll need to stat the file path provided as the first argument.

```
...this is declared within the commands object.
'tail': function (args) {
   var stats = fs.statSync(args[0]);

   console.log(stats);
}
...
```

The stat object looks like this:

```js
{ dev: 16777219,
  ino: 12794104,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 20,
  rdev: 0,
  size: 8066,
  blksize: 4096,
  blocks: 16,
  atime: Sat Oct 13 2012 15:23:59 GMT-0500 (CDT),
  mtime: Sat Oct 13 2012 13:40:02 GMT-0500 (CDT),
  ctime: Sat Oct 13 2012 13:40:04 GMT-0500 (CDT) }
```

We're concerned with the size and blksize properties for this exercise.

With these properties we can create a read stream that starts at the beginning of the file and continues until to the end. Each ```blksize``` bytes of the file will be provided to us through a callback. Here's the implementation:

```js
'tail': function (args) {
   var stats = fs.statSync(args[0]);
   
   var options = { 
     flags: 'r',
     encoding: 'utf8',
     mode: 0666,
     bufferSize: stats.blksize,
     start: 0,
     end: stats.size
   };
   
   var fileStream = fs.createReadStream(args[0], options);

   fileStream.on('data', function (data) {
      //This anonymous function (callback) will be 
      //executed for every blksize(bufferSize from options) 
      //bytes of the file.
   });
}
```





