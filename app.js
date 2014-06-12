var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sockjs  = require('sockjs');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

 // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var echo = sockjs.createServer(sockjs_opts);

echo.on('connection', function(conn) {
	console.log('\nOpen connection' + conn);
    console.log('New Dude joined: ' + conn.id);
	conn.write("\nServer says Hi");

    conn.on('data', function(message) {
        console.log('\nDude sent message ' + conn, message);
    });
	
	conn.on('close', function() {
		console.log('\nDude left: ' + conn.id);
        console.log('Close connection' + conn);
    });
});

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

echo.installHandlers(server, {prefix:'/echo'});

module.exports = app;
