var sock;

function sendRock () {
    var clientMsg = {};
    clientMsg.type = 'event';
    clientMsg.content = 'Rock';
    
	sock.send(JSON.stringify(clientMsg));
}

function sendPaper () {
    var clientMsg = {};
    clientMsg.type = 'event';
    clientMsg.content = 'Paper';
    
	sock.send(JSON.stringify(clientMsg));
}

function sendScissor () {
    var clientMsg = {};
    clientMsg.type = 'event';
    clientMsg.content = 'Scissor';
    
	sock.send(JSON.stringify(clientMsg));
}

function newConnection () {
    // incase connection already open, close it. this ensures that spamming the button doesnt creates more connections
    if(typeof sock === 'object' && (sock.readyState === 0||sock.readyState === 1)){
        closeConnection ();
    };
	sock = new SockJS('/echo');

    sock.onopen = function() {
        addText("You have JOINED the session");
    };

    sock.onmessage = function(msg) {
        var serverMsg = JSON.parse(msg.data);

        // Append the text to text area 
        addText(serverMsg.content);
    };

    sock.onclose = function() {
        addText("You have LEFT the session");
    };

}

function closeConnection () {
	sock.close();
}

function addText(text) {
	// Append the text to text area (using jQuery)
	$('#wallOfText').append('<p>' + text + '</p>');
	
	// scroll to the bottom of the div
	$('#wallOfText').scrollTop($('#wallOfText').prop('scrollHeight'));
}
