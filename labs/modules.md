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

In this lab we'll ```require()``` a file into our project.  

First create a folder called ```/planets```.  
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
The module ```circle.js``` has exported the functions ```area()``` and ```circumference()```. To export an object, add to the special exports object.  Variables local to the module will be private. In this example the variable ```PI``` is private to ```circle.js```.


Next add another file to ```/planets``` called ```earth.js``` with the following contents:

```javascript
var circle = require('./circle');
var radius = 6378.1;
console.log( 'The area of the planet earth is ' + circle.area(radius) + ' km2');
```

Now, run the app by typing ```node earth``` from within the ```planets``` directory. You should see the following:

```shell
The area of the planet earth is 127800490.57763624 km2
```

## require a JSON File

A JSON file can be included in a project by doing a ```require('./data.json')```.  This is because ```.json``` files are parsed as JSON text files.
Let's modify the previous example by storing the radius of all the planets in a JSON file. 

In the ```planets``` directory, create a file called ```planets.json``` with the following contents:

```json
{
  "mercury": 2440,
  "venus":  6051,
  "earth":  6378,
  "mars":   3397,
  "jupiter": 71492,
  "saturn": 60268,
  "uranus": 25559,
  "neptune": 24764
}
```

View the ```planets.json``` file by firing up a node shell from within the ```/planets``` directory and typing the following:

```shell
var planets = require('./planets.json');
planets.neptune;
```

Try output the radius of some other plaents.

Once you are comfortable with ```planets.json``` object,  update the ```earth.js``` example by importing ```planets.json``` into ```earth.js```.

```javascript
var planets = require('./planets.json');
```

Finally, update ```earth.js``` to use the circumference stored in ```planets.json```.


## require a Core Module

Node has several modules compiled into the binary. The core modules are defined in node's source in the ```lib/``` folder.
Core modules are always preferentially loaded if their identifier is passed to ```require()```. For instance, ```require('http')``` will always return the built in HTTP module, even if there is a file by that name.

Let's use the core module assert to test ```circle.js```.  In the ```planets/``` folder, create a file called ```test.js```.  
In ```test.js```, require the ```assert``` module and ```circle.js``` to test the ```circle.area``` and ```circle.circumference``` methods.

```javascript
var assert = require('assert');
var circle = require('./circle');
```

Next write a couple tests using the [documentation for assert](http://nodejs.org/api/assert.html)

## requiring from the node_modules directory

Modules can be installed using the node package manager, npm, to be included into your application.
For the next example, let's print out the planets in order of size. To do this, we'll include underscore.js. Before we include
NPM, we need to install underscore by executing the following command from within the ```planets/``` directory.

```npm install underscore```

Now create a file called ```size.js``` and add the following:

```javascript
var sortBy = require('underscore').sortBy,
    keys = require('underscore').keys,
    planets = require('./planets.json');

planets = sortBy(keys(planets), function(k) { return planets[k]; })

console.log(planets);
```

See [underscore.js documentation](http://underscorejs.org/#sortBy).
