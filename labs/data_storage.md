# Data Storage

## Overview

### Time 

30 minutes

### Objectives

- How to connect to mongo db.
- How to store data to mongo.
- How to retrieve data from mongo.
- How to run other actions.
    *  	Map Reduce

## Lab

1. Create a new empty directory called `mongo-lab`
2. Run `npm init`, you can skip each question.
3. Run `npm install --save mongodb`
4. Create a file named `config`

   Inside of `config.json` create an object with a member object called `"connection"` like the following.
   ```
   {
       "connection":{
           "dbName":"mongo-lab",
           "host":"localhost",
           "port":27017
       }
   }
   ```


5. Create a file named `index.js`

   At the top of the file require your `config.json` so we can get our connection information.

   ```javascript
   "use strict"
   var CONFIG = require("./config.json").connection;
   ```

   Next we'll get our mongo Classes

   ```
   "use strict"
   var CONFIG = require("./config.json").connection,
       mongodb = require('mongodb'),
       Db = mongodb.Db,
       Connection = mongodb.Connection,
       Server = mongodb.Server;
   ```

6. Create a domain to catch errors from out mongo code.

   The domain will allow us to catch all errors in a single place and know where the errors came from.


   ```javascript
   var mongoDomain = domain.create(),
       intercept = mongoDomain.intercept.bind(mongoDomain);

   mongoDomain.on('error', function (er) {
       console.error('Mongo error!', er);
   });

   mongoDomain.run(function () {
       var db = new Db(CONFIG.dbName, new Server(CONFIG.host, CONFIG.port, {safe:true}));
   });
   ```

7. Now lets create our connetion to `mongo`

   ```javascript
   mongoDomain.run(function () {
       var db = new Db(CONFIG.dbName, new Server(CONFIG.host, CONFIG.port, {safe:true}));
   });


   ```


8. Lets insert some data into mongo.

   We are going to be inserting a list of users into this database. The data can be found [here](../examples/mongo/assets/users.json)


   To insert into mongo we need to get a collection, so lets create a function that will automatcially intercept the callback and retrieve the collection.

   ```javascript
   function getCollection(collection, cb) {
   	db.collection(collection, intercept(cb));
   }
   ```

   Next lets use `getCollection` in our `insert` function.

   ```javascript
   function insert(cb) {
       //get our users data
   	var users = require("./assets/users.json");
   	//get the "users collection"
       getCollection("users", function (collection) {
           //insert the users
           collection.insert(users, intercept(cb));
       });
   }
   ```

   Lets insert the data

   ```javascript
   //be sure to open your connection
   db.open(intercept(function () {
       //insert our data
   	insert(function () {
   	    //we inserted our users!
   		console.log("Inserted Users!");
    	});
   }));
   ```

9. Ok now we can insert we should be able to remove the data.

   ```javascript
   function remove(cb) {
       getCollection("users", function (collection) {
            collection.remove(intercept(cb));
   	});
   }
   ```


10. Lets combine our insert and remove to create a `reset` function so we can keep playing with the data.

   ```javascript
   function reset(cb) {
   	remove(function () {
   		insert(cb);
   	});
   }
   ```

11. Ok lets add a method `count` our data.

   ```javascript
   function getCount(cb) {
   	getCollection("users", function (collection) {
   		collection.count(intercept(cb));
   	});
   }
   ```

12. And all together now!

   ```javascript
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
   ```

13. Now lets add a function to get the count of each users based on the first letter of their first name. To do this we will need to use the [MapReduce](http://www.mongodb.org/display/DOCS/MapReduce).

   ```javascript
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

   ```

   Now lets use it and see what we get!

   ```javascript
   db.open(intercept(function () {
   	reset(function () {
   		getCountByFirstName(function (counts) {
   			console.log("got counts by first name!");
   			console.log(JSON.stringify(counts, null, 4));
   		});
   	});
   }));
   ```

   Your output should look like this.

   ```
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

   ```

14. See if you can implement your own `findById`, and `update` function, using what we have already built and these [docs](http://mongodb.github.com/node-mongodb-native/).





