var assert = require('assert');
var servermon = require('../servermon');

describe('environment', function () {
  
  it('should restart process if SIGHUP sent', function (done) {
    done();
  });
  
  it('should restart process after delay', function (done) {
    done();
  });

  it('should call options.onStart', function (done) {
    done();
  });
  
  it('should start fork processes equal to options.children', function (done) {
    done();
  });
  
  it('should not fork if options.children = 0', function (done) {
    done();
  });
  
  it('should call options.onShutdown', function (done) {
    done();
  });
  
  it('should call options.log', function (done) {
    done();
  });
  
  it('should call options.error', function (done) {
    done();
  });
  
  it('should have real test cases', function (done) {
    assert(false);
    done();
  })
});