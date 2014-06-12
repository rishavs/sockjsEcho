var sock = new SockJS('/echo');

sock.onopen = function() {
	console.log('open');
};
sock.onmessage = function(e) {
	console.log('message', e.data);
};
sock.onclose = function() {
	console.log('close');
};

sock.send("Dude joined and stuff...");