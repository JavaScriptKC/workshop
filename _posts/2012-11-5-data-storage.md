---
layout: post
title: "5. Data Storage Lab"
author: NodeKC
tags:
---

# Data Storage

## Overview

### Time 

30 minutes

### Objectives

- How to connect to mongo db.
- How to store data to mongo.
- How to retrieve data from mongo.
- How to run other actions.
    *     Map Reduce

## Lab

1. Create a new empty directory called `mongo-lab`
2. Run `npm init`, you can skip each question.
3. Run `npm install --save mongodb`
4. Create a file named `config`

    Inside of `config.json` create an object with a member object called `"connection"` like the following.
   
        {
            "connection":{
                "dbName":"mongo-lab",
                "host":"localhost",
                "port":27017
            }
        }
   
   **Note** You could put this in your `index.js` file but it is good practice to keep configuration variables out of your source so you can easily change them later.  

5. Create a file named `index.js`

    First add `"use strict"` to the top of the file to prevent us from doing anything crazy like exporting a global variable!
   
        "use strict";

    Next require your `config.json` so we can get our connection information.
   

        "use strict"
        var CONFIG = require("./config.json").connection;

    Next we'll get our mongo Classes

        "use strict"
        var CONFIG = require("./config.json").connection,
            mongodb = require('mongodb'),
            Db = mongodb.Db,
            Server = mongodb.Server;

    * `Server` : This class represents the mongodb server 
    * `Db` : This is the class that represents a database on the mongodb `Server`

6. Create a domain to catch errors from our mongo code.


    A domain allows to handle all IO operations as a single group. In this case we want all of our mongo actions to happen in the `mongoDomain` allowing us to catch all errors in a single place. To read more about domains go [here](http://nodejs.org/api/domain.html).

        var domain = require('domain');
        var mongoDomain = domain.create(),
            intercept = mongoDomain.intercept.bind(mongoDomain);

        mongoDomain.on('error', function (er) {
            console.error('Mongo error!', er);
        });
   
    Notice how we create a new variable [`intercept`](http://nodejs.org/api/domain.html#domain_domain_intercept_callback) to which is bound to the `mongoDomain` scope. This allows us to reference `intercept` without having to type `mongoDomain.intercept` everytime.

7. Now lets create our connection to `mongo`   

        mongoDomain.run(function () {
            var db = new Db(CONFIG.dbName, new Server(CONFIG.host, CONFIG.port), {safe:true});
        });

    **Note** At this point we are not connnected to the server.


8. Lets insert some data into `mongo`.

    We are going to be inserting a list of users into this database. The data can be found [here](https://raw.github.com/nodekc/workshop/master/examples/mongo/assets/users.json))


    To insert into mongo we need to get a collection, so lets create a function that will automatcially intercept the callback and retrieves the collection.

        function getCollection(collection, cb) {
           //use intercept to allow us to catch errors
           db.collection(collection, intercept(cb));
        }
   
    Next lets use `getCollection` in our `insert` function.

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

    Lets insert the data

        //be sure to open your connection
        db.open(intercept(function () {
            //insert our data
           insert(function () {
              //we inserted our users!
              console.log("Inserted Users!");
           });
        }));

9. Ok now that we can insert data we should be able to remove the data too.

        function remove(cb) {
            getCollection("users", function (collection) {
                 //use intercept to allow us to catch errors
                 collection.remove(intercept(cb));
            });
        }


10. Lets combine our insert and remove to create a `reset` function so we can keep playing with the data.

    function reset(cb) {
       remove(function () {
          insert(cb);
       });
    }
   
11. Ok lets add a method to `count` the number of users in `mongo`.

        function getCount(cb) {
           getCollection("users", function (collection) {
              collection.count(intercept(cb));
           });
        }
   
12. And all together now!

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

13. Next lets add a function that aggregates the users by the first letter in their `firstName` property. To do this we will need to use the [MapReduce](http://www.mongodb.org/display/DOCS/MapReduce).

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

    What is that function wrapped in parens? That is called an `IIFE` (Immediatly Invoked Function Expression). This allows us to keep `map` and `reduce` private while exposing the `_getCountByFirstName` function. So `getCountByFirstName` is actually assigned to `_getCountByFirstName` while not exposing the private `map` and `reduce` functions.

    **Note** the `map` and `reduce` functions are not executed in `node` they are actually serialzed by calling the `toString` and sent to `mongo` to execute on the server. So you **cannot** use any variables that would normally be available (i.e. closure varibles).

    Notice how we pass in `{out : {inline : 1}}` this tells mongo to do the map reduce in memory. 

    Now lets use it and see what we get!

        db.open(intercept(function () {
       	   reset(function () {
              getCountByFirstName(function (counts) {
                 console.log("got counts by first name!");
                 console.log(JSON.stringify(counts, null, 4));
              });
           });
        }));

    Your output should look like this.

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

14. See if you can implement your own `findById`, and `update` function, using what we have already built and these [docs](http://mongodb.github.com/node-mongodb-native/).
