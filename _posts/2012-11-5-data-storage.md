---
layout: post
title: "Storing Some Data"
author: NodeKC
tags:
---

# Storing Some Data

Most applications just aren't useful without storing some data. Let's use mongodb to save some stuff. Oh yeah, you'll need access to an instance of mongodb to proceed with this lab.

* [Starting the project](#starting_the_project)
* [Get everything in place](#get_everything_in_place)
* [Connect to Mongo](#connect_to_mongo)
* [Insert some data](#insert_some_data)
* [Interact with the data](#interact_with_the_data)

## Starting the project

Create a new empty directory called `mongo-lab` for this lab. Inside the `mongo-lab` directory run `npm init` and feel free to skip through all the questions with the defaults. This will create a new `package.json` file for the project. `package.json` tells a reader about your project and defines dependencies your project has on other modules. Next, run `npm install --save mongodb`. This will download the `mongodb` module and save it to the `package.json` file we just created.

This is the proper way to start all Node.js projects. If you're using source control, `package.json` should be added to it. Then, if someone were to clone your repository, they would simply run `npm install` and NPM would download all of the necessary files to develop and run your project.

After all of that `package.json` should look sorta like this:

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
var mongodb = require('mongodb');
var Db      = mongodb.Db;
var Server  = mongodb.Server;
{% endhighlight %}

We went ahead and assigned the Db and Server variables to the respective `mongodb` exports, too.
* Server: Represents the mongodb server
* Db:     Represents a database on ther server

Next, let's add a file called `config.json`. Inside of `config.json` create an object with a member object called `"connection"` like the following.

{% highlight javascript %}
{
  "connection": {
    "dbName": "mongo-lab",
    "host": "localhost",
    "port": 27017
  }
}
{% endhighlight %}

**Note:** You could put this in your `index.js` file but it is good practice to keep configuration variables out of your source so you can easily change them later.  

Next require `config.json` so we can get our connection information.

{% highlight javascript %}
var mongodb = require('mongodb');
var Db      = mongodb.Db;
var Server  = mongodb.Server;

var config  = require("./config.json").connection;
{% endhighlight %}

## Connect to Mongo

{% highlight javascript %}
...

var server = new Server(config.host, config.port);
var db     = new Db(config.dbName, server, {safe:true});
{% endhighlight %}

## Insert some data

We are going to be inserting a list of users into this database. The data can be found [here](https://raw.github.com/nodekc/workshop/master/examples/mongo/assets/users.json). Download that file and save it to `./data`.

Let's create an `insert` function that will pull the data from the users file and insert it into a mongo collection called `users`.

{% highlight javascript %}
...

function insert(callback) {
  // get our users data
  var users = require("./data/users.json");

  // get the "users collection"
  db.collection("users", function (err, collection) {

    // insert the users
    collection.insert(users, callback);
  });
}
{% endhighlight %}

Now execute the `insert` function

{% highlight javascript %}
...

// be sure to open the connection to the database
db.open(function () {

  // insert our data
  insert(function () {

    // we inserted our users!
    console.log("Inserted Users!");

    // close the connection since we're done with it
    db.close();
  });
}));
{% endhighlight %}

If you run this now, you should see the following output:

{% highlight bash %}
Inserted Users!
{% endhighlight%}

And the `users` collection should be populated with our seed data.

## Interact with the data

{% highlight javascript %}
... // insert function is up here

var remove = function (callback) {
  db.collection("users", function (err, collection) {
    collection.remove(callback);
  });
};

... // db.open is down here
{% endhighlight %}

Let's also combine our insert and remove to create a `reset` function so we can keep messing with the data.

{% highlight javascript %}
... // remove function up here

var reset = function (callback) {
  remove(function () {
    insert(callback);
  });
};

... // db.open down here
{% endhighlight %}

Okay, now let's add a method to `count` the number of users in mongo.

{% highlight javascript %}
... // reset goes up here

var count = function (callback) {
  db.collection("users", function (err, collection) {
    collection.count(callback);
  });
};

... // and db.open here
{% endhighlight %}

And now we'll replace the original call to db.open with this so when we run the program it'll reset the data and invoke the count method.

{% highlight javascript %}
... // interaction functions up here

db.open(function () {
  reset(function () {
    getCount(function (err, count) {
      console.log("User count is %d", count);
      db.close();
    });
  });
});
{% endhighlight %}

And at the end of the day, this is what everything should look like:

{% highlight javascript %}
var mongodb = require('mongodb');
var Db      = mongodb.Db;
var Server  = mongodb.Server;
var config  = require("./config.json").connection;

var server = new Server(config.host, config.port);
var db     = new Db(config.dbName, server, {safe:true});

var insert = function (callback) {
  // get our users data
  var users = require("./data/users.json");

  // get the "users collection"
  db.collection("users", function (err, collection) {

    // insert the users
    collection.insert(users, callback);
  });
};

var remove = function (callback) {
  db.collection("users", function (err, collection) {
    collection.remove(callback);
  });
};

var reset = function (callback) {
  remove(function () {
    insert(callback);
  });
};

var count = function (callback) {
  db.collection("users", function (err, collection) {
    collection.count(callback);
  });
};

db.open(function () {
  reset(function () {
    getCount(function (err, count) {
      console.log("User count is %d", count);
      db.close();
    });
  });
});
{% endhighlight %}

When this is executed we should see something like this:

{% highlight bash %}
User count is 1234
{% endhighlight %}

<!--## More advanced Mongo interactions

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
{% endhighlight %}-->

See if you can implement your own `findById`, and `update` function, using what we have already built and these [the documentation for mongodb](http://mongodb.github.com/node-mongodb-native/).

Once you've gotten through the lab, raise your hand and have an instructor unlock the next lab where you can play with IRC!
