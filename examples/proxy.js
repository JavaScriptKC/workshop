var http = require('http');
var url = require('url');

var server = http.createServer(function (req, res) {
   var urlToProxy = url.parse(req.url, true);
   console.log(urlToProxy.query.url);
   http.get(urlToProxy.query.url, function (proxiedRes) {
      proxiedRes.pipe(res);
   });
});

server.listen(8000);