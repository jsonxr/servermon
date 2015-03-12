# servermon
This is a simple server helper. It responds to SIGHUP to reload it's children. This is particularly useful in a docker workflow where you need to monitor file changes and send a SIGHUP signal to a docker container to dynamically reload child processes.

* Uses cluster to create child processes specified by "children"
* Restart child process if it exits with an error
* Responds to SIGHUP sent to master process to gracefully shut down children
* Specify the number of miliseconds to wait before retrying a failed process
* Custom start/shutdown code supported
* Set custom log function to log when child processes are started/stopped
* Set custom error log function to log when a child process dies

# example
    var servermon = require('servermon');
    
    servermon({
      children: 1,
      log: function (msg) { console.log(msg); },
      error: function (msg) { console.error(msg); },
      delay: 1000,
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

# Usage

var servermon = require('servermon');
servermon(options)

# options

## children
The number of child processes that will be forked.

If 0, then no child processes will be created. This is useful for debugging in an IDE such as webstorm.

## log
This is a function that will be called any time a child process is created or destroyed. Should conform to the following signature:

    function (msg)

## error
This is a function that will be called when a child process dies unexpectedly. Should conform to the following signature:

    function (msg)

## delay
The number of milliseconds to delay restarting a child process that dies unexpectedly.

## onStart
The end result of this function should be a listening server.

## onShutdown
This is the graceful exit of a server.  Should conform to the following signature:

    function (callback)
