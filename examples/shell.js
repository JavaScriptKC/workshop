var path = require('path');
var fs = require('fs');
var stdin = process.openStdin();

var commands = {
   'ls': function (args) {
      fs.readdir(args[0] || process.cwd(), function (err, entries) {
         entries.forEach(function (e) {
            console.log(e);
         });
      });
   },
   'pwd': function () {
      console.log(process.cwd());
   },
   'cd': function (args) {
      process.chdir(path.resolve(process.cwd(), args[0]));
   },
   'tail': function (args) {

   }
};

stdin.on('data', function (d) {
   var matches = d.toString().match(/(\w+)(.*)/i);
   var command = matches[1].toLowerCase();
   var args = matches[2].trim().split(/\s/);

   commands[command](args);
});