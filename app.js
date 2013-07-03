var sag = require('sag').serverFromURL( process.env.CLOUDANT_URL || 'http://admin:admin@localhost' ),
    restify = require('restify'),
    moment = require('moment'),
    server,
    api_key_handler

api_key_handler = function( api_key ){

  return function( req, res, next ){
    if ( req.params.api_key === (process.env.API_KEY || api_key) ) {
      return next()
    } else {
      return next(new restify.InvalidArgumentError('API KEY not valid.'))
    }
  }

}

sag.setDatabase('log')
server = restify.createServer()
server.use(restify.queryParser())
server.use(restify.jsonp())
server.use(api_key_handler('123'))

server.get('/log', function( req, res, next ){
  var now = moment().valueOf(),
      data

  data = req.params
  data._id = now.toString()

  sag.put({
    id : now.toString(),
    data : data,
    callback: function(resp, success) {
      res.send({ ok: success })
    }
  })

  return next()
})

server.listen( process.env.PORT || 8080 )
