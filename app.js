
/**
 * Module dependencies.
 */

var express = require('express')
  , mysql = require('mysql')
  , routes = require('./routes')
  , keys = require('../secret/keys.js')
  , connections = require('../secret/connections.js');

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

// FOURSQUARE **********************************************
var Foursquare = require("node-foursquare-2")(keys.foursquare);
// FOURSQUARE **********************************************

// MYSQL ***************************************************
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : connections.mysql.host
  ,user     : connections.mysql.user
  ,password : connections.mysql.password
  ,database : connections.mysql.database
});

// MYSQL ***************************************************

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
      connection.connect();
            
      //connection.query('SELECT * FROM users WHERE access_token = '+ connection.escape(accessToken), function(err, rows, fields) {
        //if (err) {
		//  throw err;
		//}else{
		  //console.log('Query result: ', rows);
		  //if(rows == 0){
		    // new user, add them
			var post = { 'access_token' : accessToken };
		    console.log('welcome new person');
		    connection.query("INSERT INTO users SET ?", post, function(err, result) {
				console.log('inserted?');
			});
		  //}else{
			// old user
			//console.log('welcome back');
		  //}
	    //}
      //});
      
      connection.end();
      console.log(accessToken);
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
