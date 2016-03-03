
var assert = require('assert');
var querystring = require('querystring');
var request = require('request')
var https = require('https')
var fs = require('fs')
var path = require('path')

exports.requestFacebookApi = function(http, host, port, path, params, withMultipart, callback) {
  var req = new FacebookApiRequest(http, host, port, path, params);
  req.start(withMultipart, callback);
};

// export for debug
exports.FacebookApiRequest = FacebookApiRequest;

function bindSelf(self, fn) {
  return function selfBoundFunction() {
    return fn.apply(self, arguments);
  };
}

function FacebookApiRequest(http, host, port, path, params) {
  assert.equal(this.http, null);
  assert.equal(this.host, null);
  assert.equal(this.port, null);
  assert.equal(this.path, null);
  assert.equal(this.params, null);

  // TODO request timeout setting
  // TODO user agent setting

  this.http = http;
  this.host = host;
  this.port = port;
  this.path = path;
  this.params = params;
}

FacebookApiRequest.prototype.http = null;
FacebookApiRequest.prototype.host = null;
FacebookApiRequest.prototype.port = null;
FacebookApiRequest.prototype.path = null;
FacebookApiRequest.prototype.params = null;
FacebookApiRequest.prototype.callback = null;

FacebookApiRequest.prototype.start = function(withMultipart, callback) {
  assert.equal(this.req, null);
  assert.equal(this.callback, null);

  this.callback = callback;

  var opts = {
    url: (this.http === https ? 'https://' : 'http://') + this.host + ':' + this.port + '/' + this.path
  }

  if (withMultipart) {
    var formData = opts.formData = {};

    for (var key in this.params) {
      if (this.params.hasOwnProperty(key)) {
        var val = this.params[key];
        // this may need work to handle content-types correctly
        formData[key] = val.charAt(0) !== '@' ? val : {
          value: fs.createReadStream(val.slice(1)),
          options: {
            contentType: 'application/octet-stream',
            filename: path.basename(val.slice(1))
          }
        }
      }
    }
  }
  else {
    opts.form = this.params || {}
  }

  request.post(opts, function(err, resp, body){
    if (err) {
      callback(err)
    }
    else {
      callback(null, body)
    }
  })
};
