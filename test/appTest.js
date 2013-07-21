var expect = require('chai').expect,
    restify = require('restify'),
    couch = require('sag').serverFromURL( process.env.CLOUDANT_URL || 'http://admin:admin@localhost' );

var client = restify.createJsonClient({
  url: 'http://127.0.0.1:8080',
  version: '*'
});

couch.setDatabase('logs');

describe( 'Logger', function(){

  it( 'should fail if the API key is not valid or doesn\'t exist', function( done ){
    client.get( '/log', function(err, req, res, obj){
      expect( err ).not.to.be.null;
      done();
    });
  });

  it( 'should log a request', function( done ){
    var random = Math.random().toString(36).substring(7);
    client.get( '/log?api_key=123&uuid=' + random, function(err, req, res, obj){
      expect( err ).to.be.null;
      couch.getAllDocs({
        limit: 1,
        includeDocs: true,
        descending: true,
        callback: function(resp, succ) {
          expect( resp.body.rows[0].doc.uuid ).to.equal(random);
          done();
        }
      });
    });
  });

  it( 'should decrypt the request if the parameter e is present', function( done ){
    var random = Math.random().toString(36).substring(7);
    var base64 = new Buffer( JSON.stringify({ api_key: 123, uuid: random }) ).toString('base64');
    client.get( '/log?e=' + base64, function(err, req, res, obj){
      expect( err ).to.be.null;
      couch.getAllDocs({
        limit: 1,
        includeDocs: true,
        descending: true,
        callback: function(resp, succ) {
          expect( resp.body.rows[0].doc.uuid ).to.equal(random);
          done();
        }
      });
    });
  });

  it( 'should reply with a valid image on /pixel.png route', function( done ){
    client.get( '/pixel.png?api_key=123', function(err, req, res, obj){
      expect( err ).to.be.null;
      expect( res.headers['content-type'] ).to.match(/^image/);
      done();
    });
  });

});

