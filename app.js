var couch = require('sag').serverFromURL( process.env.CLOUDANT_URL || 'http://admin:admin@localhost' ),
    restify = require('restify'),
    moment = require('moment'),
    _ = require('underscore'),
    request = require('request'),
    fs = require('fs'),
    server,
    encryption_handler,
    api_key_handler,
    log_hanlder;


encryption_handler = function(){

  return function( req, res, next ){
    if ( req.params.e ) {
      try {
        var json = JSON.parse( new Buffer(req.params.e, 'base64').toString('ascii') );
        _.extend( req.params, json );
      } catch(e) {}
    }
    return next();
  };

};

api_key_handler = function( api_key ){

  return function( req, res, next ){
    if ( ~~ req.params.api_key === ~~ (process.env.API_KEY || api_key) ) {
      return next();
    } else {
      return next(new restify.InvalidArgumentError('API KEY not valid.'));
    }
  };

};

log_handler = function(){

  return function( req, res, next ){
    var now = moment().valueOf();

    var data = _.extend( {}, req.params, {_id : now.toString()} );

    couch.put({
      id : data._id,
      data : data,
      callback: function(resp, success) {
        if ( success )
          return next();
        else {
          return next(new restify.InternalError(resp.body.error + ': ' + resp.body.reason));
        }
      }
    });

  };

};

couch.setDatabase('logs');
server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.jsonp());

server.get('/', function( req, res, next ){
  res.write( fs.readFileSync('./assets/usage.html', { encoding: 'utf-8' }) );
  res.end();
});

server.get('/log', encryption_handler(), api_key_handler('123'), log_handler(), function( req, res, next ){
  res.json({ ok: true });
  return next();
});

server.get('/pixel.png', encryption_handler(), api_key_handler('123'), log_handler(), function( req, res, next ){
  var image = req.params.image_url || 'http://www.golivetutor.com/download/spacer.gif';
  request(image).pipe(res);
  return next();
});

server.listen( process.env.PORT || 8080 );
