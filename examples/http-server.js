var http = require('http');

var response = "<html>" +
"<head>" +
"<title>Hello World!</title>" +
"</head>" +
"<body>" +
"<h1>We made it!</h1>" +
"<p>The time is {time}!</p>" +
   "<ul>" +
      "<li>Node version: {node}</li>" +
      "<li>V8 version: {v8}</li>" +
   "<ul>" +
"</body>" +
"</html>";

var templateEngine = function (template, data) {

   var vars = template.match(/\{\w+\}/g);
   
   if (vars === null) {
      return template;
   }
   
   var nonVars = template.split(/\{\w+\}/g);
   var output = '';

   for (var i = 0; i < nonVars.length; i++) {
      output += nonVars[i];

      if (i < vars.length) {
         var key = vars[i].replace(/[\{\}]/g, '');
         output += data[key]
      }
   }

   return output;
};

var server = http.createServer(function (req, res) {
   res.writeHead(200);
   
   res.write(templateEngine(response, {
      time: new Date().toString(),
      node: process.versions.node,
      v8: process.versions.v8,
   }));

   res.end();
});

var port = 8080;
server.listen(port);
console.log('Listening on port ' + port);
