# Static HTTP server

## Overview

### Time 

30 minutes

### Objectives

- How to use Node Core HTTP module.
- How to bind an HTTP server to a port.
- How to accept HTTP requests.
- How to respond to incoming HTTP requests.
   - HTTP Status: 200 OK
   - With content

## Lab

In this lab we will create an HTTP server that responds to all requests with a simple HTML template.

1. Create a new file named ```server.js``` in a directory of your choice.
2. Include the HTTP core module using the ```require(module)``` function and assign the return value to a variable named ```http```. 
   
   ```JavaScript
   var http = require('http');
   ```

3. To create a HTTP server execute the ```http.createServer``` ([api doc](http://nodejs.org/api/http.html#http_http_createserver_requestlistener)) function with an anonymous function as an argument and assign it to the ```server``` variable.

   ```JavaScript
   var http = require('http');

   var server = http.createServer(function () { });
   ```

4. This server is not yet bound to any port. In order to bind to a port, the [server](http://nodejs.org/api/http.html#http_class_http_server) object has the function ```server.listen(port)``` that takes a port as the first argument.

   ```JavaScript
   var http = require('http');

   var server = http.createServer(function () { });
   
   server.listen(8080);
   ```
5. Launch your server at the command line: ```node server.js```

6. Open your browser and navigate to ```http://localhost:8080``` (replace 8080 with whatever port you chose if different). You will notice that your browser seems to hang and will eventually timeout. This is because our HTTP is not yet doing anything useful with the incoming connection. Let's start by responding to the request with a 200 HTTP status code.

   Here's where we are so far.
   
   ```JavaScript
   var http = require('http');
   
   var server = http.createServer(function (req, res) { 
      res.statusCode = 200;
      res.end();
   });
   
   server.listen(8080);
   ```

   Notice we have added a few arguments to the anonymous function ```req``` and ```res```. These represent the [request](http://nodejs.org/api/http.html#http_class_http_serverrequest) and [response](http://nodejs.org/api/http.html#http_class_http_serverresponse) streams respectively. 

   A call to ```res.end()``` is required in order to let the client know the server has finished the response.

7. Visit ```http://localhost:8080``` once again. This time there should be a page with no content, but we are not here to serve blank pages. Let's actually write some data. The response stream has a ```write``` function that takes a string to write to the output. 

   ```JavaScript
   var http = require('http');

   var server = http.createServer(function (req, res) { 
      res.statusCode = 200;
      res.write('Hello World!');
      res.end();
   });

   server.listen(8080);
   ```
   
### Write a files contents to HTTP response

1. To load a files content from disk:

   ```JavaScript
   var fs = require('fs');

   fs.readFile('index.html', function (err, data) {
      if(!err) {
         console.log(data); 
      } 
   });

   ```

1. This won't work because theres no index.html in our directory. Let's create that with something like this:

   ```HTML
   <html>
      <head>
         <title>My Node.JS server</title>
      </head>
      <body>
         <h1>Hello World!</h1>
      </body>
   </html>
   ```

1. Now that we know how to read a file from disk let's join that with our previous HTTP server example.

   ```JavaScript
   var fs = require('fs');
   var http = require('http');

   var server = http.createServer(function (req, res) { 
      res.statusCode = 200;

      fs.readFile('index.html', function (err, data) {
            if(!err) {
              res.write(data);
              res.end();
            } 
         });
   });

   server.listen(8080);
   ```

### A simple template engine

1. It's boring to serve content that doesn't change! So let's create a simple template engine to serve dynamic objects.

```JavaScript
var templateEngine = function (template, data) {

   var vars = template.match(/\{\w+\}/g);

   if (vars === null) {
      return template;
   }

   var nonVars = template.split(/\{\w+\}/g);
   var output = '';

   for (var i = 0; i < nonVars.length; i++) {
      output += nonVars[i];

      if (i < vars.length) {
         var key = vars[i].replace(/[\{\}]/g, '');
         output += data[key]
      }
   }

   return output;
};
```

1. This function takes a template string and a data object. It searches for instances of ```{variableName}``` and replaces them with data.variableName. Feel free to copy/paste this code unless you want extra practice with JavaScript.

Let's use this simple template engine to parse the content of our ```index.html``` file.

```JavaScript
var fs = require('fs');
var http = require('http');

var templateEngine = function (template, data) {

   var vars = template.match(/\{\w+\}/g);
   
   if (vars === null) {
      return template;
   }
   
   var nonVars = template.split(/\{\w+\}/g);
   var output = '';

   for (var i = 0; i < nonVars.length; i++) {
      output += nonVars[i];

      if (i < vars.length) {
         var key = vars[i].replace(/[\{\}]/g, '');
         output += data[key]
      }
   }

   return output;
};

var server = http.createServer(function (req, res) { 
   res.statusCode = 200;

   fs.readFile('index.html', function (err, data) {
      if(!err) {
         res.write(templateEngine(data, {}));
         res.end();
      } 
   });
});

server.listen(8080);
```

Now try this in the browser. You'll notice that the output is the same. Let's change ```index.html``` a little to take advantage of our template engine.

```HTML
<html>
   <head>
      <title>My Node.JS server</title>
   </head>
   <body>
      <h1>Hello {name}!</h1>
      <ul>
         <li>Node Version: {node}</li>
         <li>V8 Version: {v8}</li>
         <li>URL: {url}</li>
         <li>Time: {time}</li>
      </ul>
   </body>
</html>
```
   
The above modifications require several properties on our data object (name, node, v8, url, time), let's assign those:

```JavaScript
   ... (code omitted from example)
   fs.readFile('index.html', function (err, data) {
      if(!err) {
        res.write(templateEngine(data, {
          name: 'Ryan Dahl',
          node: process.versions.node,
          v8: process.versions.v8,
          time: new Date(),
          url: req.url
        }));
        res.end();
      } 
   });
   ... (code omitted from example)
```

Now our output from the browser (if we visited ```http://localhost:8080/foo```) should be: 

```
Hello Ryan Dahl!

Node Version: 0.8.8
V8 Version: 3.11.10.19
URL: /foo
Time: Fri Oct 05 2012 10:56:17 GMT-0500 (Central Daylight Time)
```

