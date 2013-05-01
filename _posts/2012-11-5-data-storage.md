---
layout: post
title: "Storing Some Data"
author: NodeKC
tags:
---

# Storing Some Data

Most applications just aren't useful without storing some data. Let's use mongodb to save some stuff. Oh yeah, you'll need access to an instance of mongodb to proceed with this lab. This lab will also introduce the advanced concept of domains for error handling.

## Starting the project

Create a new empty directory called `mongo-lab` for this lab. Inside the `mongo-lab` directory run `npm init` and feel free to skip through all the questions with the defaults. This will create a new `package.json` file for the project. `package.json` tells a reader about your project and defines dependencies your project has on other modules. Next, run `npm install --save mongodb`. This will download the `mongodb` module and save it to the `package.json` file we just created.

This is the proper way to start all Node.js projects. If you're using source control, `package.json` should be added to it. Then, if someone were to clone your repository, they would simply run `npm install` and NPM would download all of the necessary files to develop and run your project.

After all of that `package.json` should look sorta like this

{% highlight javascript %}
{
  "name": "mongo-lab",
  "version": "0.0.0",
  "description": "",
  "main": "index.js",
  "repository": "",
  "author": "",
  "license": "BSD",
  "dependencies": {
    "mongodb": "~1.3.0"
  }
}
{% endhighlight %}

## Get everything in place

Create a file named `index.js`. This will be where we do all of the fun stuff. Inside `index.js` go ahead and `require()` the `mongodb` module we installed earlier.

{% highlight javascript %}
var mongodb = require('mongodb'),
    Db      = mongodb.Db,
    Server  = mongodb.Server;
{% endhighlight %}

We went ahead and assigned the Db and Server variables to the respective `mongodb` exports, too.
* Server: Represents the mongodb server
* Db:     Represents a database on ther server

Next, let's add a file called `config.json`. Inside of `config.json` create an object with a member object called `"connection"` like the following.

{% highlight javascript %}
{
  "connection":{
    "dbName":"mongo-lab",
    "host":"localhost",
    "port":27017
  }
}
{% endhighlight %}

**Note** You could put this in your `index.js` file but it is good practice to keep configuration variables out of your source so you can easily change them later.  

Next require `config.json` so we can get our connection information.

{% highlight javascript %}
var mongodb = require('mongodb'),
    Db      = mongodb.Db,
    Server  = mongodb.Server;

var CONFIG  = require("./config.json").connection;
{% endhighlight %}

## Tangent into domains!
6. Create a domain to catch errors from our mongo code.


A domain allows to handle all IO operations as a single group. In this case we want all of our mongo actions to happen in the `mongoDomain` allowing us to catch all errors in a single place. To read more about domains go [here](http://nodejs.org/api/domain.html).

{% highlight javascript %}
var domain = require('domain');
var mongoDomain = domain.create(),
    intercept = mongoDomain.intercept.bind(mongoDomain);

mongoDomain.on('error', function (er) {
  console.error('Mongo error!', er);
});
{% endhighlight %}

Notice how we create a new variable [`intercept`](http://nodejs.org/api/domain.html#domain_domain_intercept_callback) to which is bound to the `mongoDomain` scope. This allows us to reference `intercept` without having to type `mongoDomain.intercept` everytime.

7. Now lets create our connection to `mongo`

{% highlight javascript %}
mongoDomain.run(function () {
  var db = new Db(CONFIG.dbName, new Server(CONFIG.host, CONFIG.port), {safe:true});
});
{% endhighlight %}

**Note** At this point we are not connnected to the server.


8. Lets insert some data into `mongo`.

We are going to be inserting a list of users into this database. The data can be found [here](https://raw.github.com/nodekc/workshop/master/examples/mongo/assets/users.json))

To insert into mongo we need to get a collection, so lets create a function that will automatcially intercept the callback and retrieves the collection.

{% highlight javascript %}
function getCollection(collection, cb) {
  //use intercept to allow us to catch errors
  db.collection(collection, intercept(cb));
}
{% endhighlight %}

Next lets use `getCollection` in our `insert` function.

{% highlight javascript %}
function insert(cb) {
  //get our users data
  var users = require("./assets/users.json");
  //get the "users collection"
  getCollection("users", function (collection) {
    //insert the users
    //use intercept to allow us to catch errors
    collection.insert(users, intercept(cb));
  });
}
{% endhighlight %}

Lets insert the data

{% highlight javascript %}
//be sure to open your connection
db.open(intercept(function () {
  //insert our data
  insert(function () {
    //we inserted our users!
    console.log("Inserted Users!");
  });
}));
{% endhighlight %}

9. Ok now that we can insert data we should be able to remove the data too.

{% highlight javascript %}
function remove(cb) {
  getCollection("users", function (collection) {
    //use intercept to allow us to catch errors
    collection.remove(intercept(cb));
  });
}
{% endhighlight %}


10. Lets combine our insert and remove to create a `reset` function so we can keep playing with the data.

{% highlight javascript %}
function reset(cb) {
  remove(function () {
    insert(cb);
  });
}
{% endhighlight %}

11. Ok lets add a method to `count` the number of users in `mongo`.

{% highlight javascript %}
function getCount(cb) {
  getCollection("users", function (collection) {
    collection.count(intercept(cb));
  });
}
{% endhighlight %}

12. And all together now!

{% highlight javascript %}
mongoDomain.run(function () {
  var db = new Db(CONFIG.dbName, new Server(CONFIG.host, CONFIG.port, {safe:true}));


  function getCollection(collection, cb) {
    db.collection(collection, intercept(cb));
  }

  function reset(cb) {
    remove(function () {
      insert(cb);
    });
  }

  function insert(cb) {
    var users = require("./assets/users.json");
    getCollection("users", function (collection) {
      collection.insert(users, intercept(cb));
    });
  }

  function remove(cb) {
    getCollection("users", function (collection) {
      collection.remove(intercept(cb));
    });
  }

  function getCount(cb) {
    getCollection("users", function (collection) {
      collection.count(intercept(cb));
    });
  }

  db.open(intercept(function () {
    reset(function () {
      getCount(function (count) {
        console.log("User count is %d", count);
      });
    });
  }));
});
{% endhighlight %}

13. Next lets add a function that aggregates the users by the first letter in their `firstName` property. To do this we will need to use the [MapReduce](http://www.mongodb.org/display/DOCS/MapReduce).

{% highlight javascript %}
var getCountByFirstName = (function getCountByFirstName() {
function map() {
  if (this.firstName) {
    emit(this.firstName.charAt(0), 1);
  }
}

function reduce(key, values) {
  return values.length;
}

return function _getCountByFirstName(cb) {
  getCollection("users", function getUsersCollection(collection) {
    collection.mapReduce(map, reduce, {out:{inline:1}}, intercept(cb));
  });
};
}());
{% endhighlight %}

What is that function wrapped in parens? That is called an `IIFE` (Immediatly Invoked Function Expression). This allows us to keep `map` and `reduce` private while exposing the `_getCountByFirstName` function. So `getCountByFirstName` is actually assigned to `_getCountByFirstName` while not exposing the private `map` and `reduce` functions.

**Note** the `map` and `reduce` functions are not executed in `node` they are actually serialzed by calling the `toString` and sent to `mongo` to execute on the server. So you **cannot** use any variables that would normally be available (i.e. closure varibles).

Notice how we pass in `{out : {inline : 1}}` this tells mongo to do the map reduce in memory. 

Now let's use it and see what we get!

{% highlight javascript %}
db.open(intercept(function () {
  reset(function () {
    getCountByFirstName(function (counts) {
      console.log("got counts by first name!");
      console.log(JSON.stringify(counts, null, 4));
    });
  });
}));
{% endhighlight %}

Your output should look like this.

{% highlight javascript %}
got counts by first name!
[
  {
    "_id": "A",
    "value": 14
  },
  {
    "_id": "B",
    "value": 6
  },
  {
    "_id": "C",
    "value": 6
  },
  {
    "_id": "D",
    "value": 9
  },
  .
  .
  .
  {
    "_id": "W",
    "value": 3
  },
  {
    "_id": "Y",
    "value": 2
  },
  {
    "_id": "Z",
    "value": 2
  }
]
{% endhighlight %}

14. See if you can implement your own `findById`, and `update` function, using what we have already built and these [docs](http://mongodb.github.com/node-mongodb-native/).

Once you've gotten through the lab, raise your hand and have an instructor unlock the next lab where you can play with IRC.
