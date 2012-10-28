# Modules

## Overview

### Time

30 minutes

### Objectives

- How to require node modules in a project.
- How to require a JSON file as a module
- How to require a core module
- How to require from the node_modules folder
- How to export methods in a module


## require() a node module

In this lab we'll ```require()``` a file into our project.  To start create a folder called ```/planets```.  
Inside of ```/planets```, create a  file called ```circle.js``` with the following contents:

```javascript
var PI = Math.PI;

exports.area = function (r) {
  return PI * r * r;
};

exports.circumference = function (r) {
  return 2 * PI * r;
};
````
Next, add another file to ```/planets``` called ```earth.js``` with the following contents:

```javascript
var circle = require('./circle.js');
var radius = 6378.1;
console.log( 'The area of the planet earth is ' + circle.area(radius) + ' km2');
```

Now, run the app by typing ```node earth``` from within the ```planets``` directory.
