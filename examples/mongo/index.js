"use strict";
var CONFIG = require("./config.json").connection,
    mongodb = require('mongodb'),
    Db = mongodb.Db,
    Connection = mongodb.Connection,
    Server = mongodb.Server,
    domain = require("domain");


var mongoDomain = domain.create(),
    intercept = mongoDomain.intercept.bind(mongoDomain);

mongoDomain.on('error', function (er) {
    console.error('Mongo error!', er);
});

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
        getCollection("users", function getUsersCollection(collection) {
            collection.insert(users, intercept(cb));
        });
    }

    function remove(cb) {
        getCollection("users", function getUsersCollection(collection) {
            collection.remove(intercept(cb));
        });
    }


    function getCount(cb) {
        getCollection("users", function getUsersCollection(collection) {
            collection.count(intercept(cb));
        });
    }

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

    db.open(intercept(function () {
        reset(function () {
            getCount(function (count) {
                console.log("User count is %d", count);

                getCountByFirstName(function (counts) {
                    console.log("got counts by first name!");
                    console.log(JSON.stringify(counts, null, 4));
                });

            });
        });
    }));

});