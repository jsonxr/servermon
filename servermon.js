var cluster = require('cluster');

function restartWorker(options, worker, timeout) {
  var log = options.log || function () {};
  var new_worker = cluster.fork();
  log('child ' + new_worker.id + ' started');
  new_worker.once('listening', function () {
    log('child ' + new_worker.id + ' listening...');
    worker.send('shutdown');
    setTimeout(function () {
      if (worker.state !== 'dead') {
        log(worker);
        worker.kill();
      }
    }, timeout); // force close after <timeout> seconds
  });
}

function forkWorker(log) {
  var worker = cluster.fork();
  log('child ' + worker.id + ' started');
  worker.once('listening', function () {
    log('child ' + worker.id + ' listening...');
  });
}

function startMaster(options) {
  options = options || {};
  var timeout = options.timeout || 60000;
  var children = options.children !== undefined ? options.children : 1;
  var restart = options.restart !== undefined ? options.restart : true;
  var log = options.log || function () {};
  var error = options.error || function (msg) { console.error(msg); };
  var delay = options.delay || 3000; // 3 second delay before restarting server
  var onMaster = options.onMaster || nullop;
  
  log('started master');

  onMaster(function (err) {
    if (err) { return error(err); }
    
    process.on('SIGHUP', function () {
      log('Received SIGHUP. Reloading...');
      for(var id in cluster.workers) {
        restartWorker(options, cluster.workers[id], timeout);
      }
    });
    // fork the processes
    if (children > 0) {
      for (var i = 0; i < children; i++) {
        forkWorker(options.log);
      }

      if (restart) {
        cluster.on('exit', function (worker, code, signal) {
          // Replace the dead worker
          // Restart if it was not a graceful exit
          var keys = Object.keys(cluster.workers);
          if (code > 0 && keys.length < children) {
            error('\nchild '+worker.id+' died with error code ' + code + '. Restarting in '+delay+'ms...');
            error('\n     :^(\n\n');
            setTimeout(function () {
              forkWorker(options.log);
            }, delay);
          } else {
            log('child ' + worker.id + ' exited with error code 0')
          }
        });
      }
    } else {
      startChild(options);
    }  
  });
  
}

function nullop(callback) {
  if (callback) {
    callback();
  }  
}

function startChild(options) {
  var onStart = options.onStart || nullop;
  var onShutdown = options.onShutdown || nullop;
  var log = options.log || function () {};

  process.on('message', function(msg) {
    if (msg === 'shutdown') {
      log('shutdown child ' + cluster.worker.id);
      onShutdown(function () {
        log('child '+cluster.worker.id+' shut down');
        process.exit(0);
      });
    }
  });

  onStart();
}

var servermon = function (options) {
  options = options || {};

  if (cluster.isMaster) {
    startMaster(options);
  } else {
    startChild(options);
  }
};


module.exports = servermon;