
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , keys = require('../secret/keys.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var Foursquare = require("node-foursquare")(keys.foursquare);

/************************************************************/

app.get('/login', function(req, res) {
  res.writeHead(303, { "location": Foursquare.getAuthClientRedirectUrl() });
  res.end();
});


app.get('/callback', function (req, res) {
  Foursquare.getAccessToken({
    code: req.query.code
  }, function (error, accessToken) {
    if(error) {
      res.send("An error was thrown: " + error.message);
    }
    else {
      // Save the accessToken and redirect
	  console.log('redirecting...');
	  res.writeHead(302, {
	    'Location': '/'
	  });
	  res.end();
    }
  });
});
/************************************************************/

// Routes

app.get('/', routes.index);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
