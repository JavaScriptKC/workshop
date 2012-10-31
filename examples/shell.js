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
   'head': function () {
    
   },
   'tail': function (args) {
      fs.stat(args[0], function (err, stats) {
         
         if (stats.size === 0) {
            return;
         }

         var options = { 
            flags: 'r',
            encoding: 'utf8',
            mode: 0666,
            bufferSize: 10,
            start: 0,
            end: stats.size
         };

         var offset = 0;
         // Keep track of one extra newline
         // So we can start reading in the contents starting
         // at the next character
         var numLines = (args[1] || 10) + 1; 
         var newLines = new Array(numLines);
         var index = 0;

         var fileStream = fs.createReadStream(args[0], options);
         
         fileStream.on('data', function (data) {
            for (var i = 0; i < data.length; i++) { 
               if (data[i] === '\n') {
                  newLines[index] = offset + i;
                  index = ++index % numLines;
               }
            }

            offset += data.length;
         });

         fileStream.on('end', function () {
            if (typeof newLines[index] === 'number') {
               var position = newLines[index] + 1;
            } 
            else {
               var position = 0;
            }
            
            var bytesToRead = stats.size - position;

            fs.open(args[0], 'r', function (err, fd) {
               var buffer = new Buffer(bytesToRead);
               fs.readSync(fd, buffer, 0, bytesToRead, position);
               console.log(buffer.toString())
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
