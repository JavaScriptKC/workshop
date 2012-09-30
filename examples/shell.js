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
      fs.stat(args[0], function (err, stats) {
         
         var options = { 
           flags: 'r',
           encoding: 'utf8',
           mode: 0666,
           bufferSize: stats.blksize,
           start: 0,
           end: stats.size
         };

         var offset = 0;
         var numLines = 10;
         var newLines = new Array(numLines);
         var index = 0;

         var fileStream = fs.createReadStream(args[0], options);
         
         fileStream.on('data', function (data) {
            for (var i = 0; i < data.length; i++) { 
               if (data[i] === '\n') {
                  newLines[index] = (offset * stats.blksize) + i;
                  index = ++index % numLines;
               }
            }

            offset++;
         });

         fileStream.on('end', function () {
            var end = newLines.splice(0, index);
            newLines = newLines.concat(end);
            options.start = newLines[0] + 1;

            fs.createReadStream(args[0], options)
            .on('data', function (d) {
               console.log(d.toString());
            });
         });
      });  
   }
};

stdin.on('data', function (d) {
   var matches = d.toString().match(/(\w+)(.*)/i);
   var command = matches[1].toLowerCase();
   var args = matches[2].trim().split(/\s+/);

   commands[command](args);
});