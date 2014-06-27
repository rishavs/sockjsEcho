var express = require('express');
var path = require('path');
var sockjs  = require('sockjs');

var routes = require('./routes/index');

var app = express();

var maxConnections = 2; 

 // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var echo = sockjs.createServer();
var currentConnections = [];

echo.on('connection', function(conn) {

	currentConnections.push(conn);
    var numConnections = currentConnections.length;
    var serverMsg = {};
    
    console.log('\n[' + conn.id + ']' + ' JOINED');
    console.log('\nNumber of Connections = ' + numConnections);
    
    // check for number of connections
    if (numConnections >=3) {
        //if the connection numbers is less than the number of max connections, show a welcoming message only to this specific client
        serverMsg.type = 'max';
        serverMsg.content = '[SERVER WHISPERED TO YOU] :' + 'Sorry ' + '[' + conn.id + ']' + '. Only 2 connections are allowed!';
        console.log(serverMsg)
        conn.write(JSON.stringify(serverMsg));
        console.log('\n Max Connection Reached!');
        
        //disconnect the client
        conn.end();
        }
    else {
        //if the connection numbers is less than the number of max connections, show a welcoming message only to this specific client
        serverMsg.type = 'join';
        serverMsg.content = '[SERVER BROADCASTED TO ALL] : ' + '[' + conn.id + ']' + ' JOINED';
        console.log(serverMsg)
        broadcast(JSON.stringify(serverMsg));
        
        // welcome msg
        serverMsg.type = 'welcome';
        serverMsg.content = '[SERVER WHISPER TO YOU] :' + 'Hello ' + '[' + conn.id + ']' + '. Welcome!';
        console.log(serverMsg)
        conn.write(JSON.stringify(serverMsg));
    }

    conn.on('data', function(msg) {
        var clientMsg = JSON.parse(msg);
        console.log('\n[' + conn.id + ']' + ' sent message : ' + clientMsg.content);
        serverMsg.type = 'echo';
        serverMsg.content = '[SERVER BROADCASTED TO ALL] : ' + '[' + conn.id + ']' + ' sent message : ' + '<b>' + clientMsg.content + '</b>';
        console.log(serverMsg)
        broadcast(JSON.stringify(serverMsg));
    });
	
	conn.on('close', function() {
		console.log('\n[' + conn.id + ']' + ' LEFT');
        serverMsg.type = 'leave';
        serverMsg.content = '[SERVER BROADCASTED TO ALL] : ' + '[' + conn.id + ']' + ' LEFT';
        console.log(serverMsg)
        broadcast(JSON.stringify(serverMsg));
        
		// remove the closed connection from the list
		removeFromArray(currentConnections, conn);
        console.log('\nNumber of Connections = ' + currentConnections.length);
    });
});

function broadcast(message){
  // iterate through each client in clients object
    // write the message to all connected clients
    for (var i=0; i<currentConnections.length; i++) {
      currentConnections[i].write(message);
	  console.log('Broadcasting to ' + currentConnections[i].id);
    }
}

function removeFromArray (array, element ) {
	// I seriously have to write this? wow... how bass-ackwards is this lang?
	while (array.indexOf(element) !== -1) {
		array.splice(array.indexOf(element), 1);
	}
}

var server = app.listen(3000, function() {
    console.log('Listening on port %d', server.address().port);
});

// attach sockjs event emitter to server
echo.installHandlers(server, {prefix:'/echo'});

module.exports = app;
