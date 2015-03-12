var servermon = require('./servermon');

servermon({
  children: 1,
  log: function (msg) { console.log(msg); },
  error: function (msg) { console.error(msg); },
  delay: 1000,
  onMaster: function (callback) {
    console.log('onMaster called');
    callback();
  },
  onStart: function () {
    var http = require('http');
    this.server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World 2\n');
    }).listen(3000);
    console.log('listening on port 3000')
  },
  onShutdown: function (callback) {
    // initiate graceful close of any connections to server
    console.log('closing gracefully...');
    this.server.close(callback);
  }
});
