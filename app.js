/****************************************************************************************
* Global variables
*****************************************************************************************/
var express = require('express')
,	app = express()
,	server = require('http').createServer(app)
,	io = require('socket.io').listen(server)
,	path = require('path');


/****************************************************************************************
* Server
*****************************************************************************************/
var port = normalizePort(process.env.PORT || '3000');

server.listen(port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}





/****************************************************************************************
* Static file routing
*****************************************************************************************/
app.use(express.static(path.join(__dirname, 'public'),{
  redirect : false,
  index : false,
  maxAge : '365 days',
}));

app.get('/',function(req, res){
	res.sendFile(__dirname + '/index.html');

});

app.get('/public/css/style.css',function(req, res){
	res.sendFile(__dirname + '/public/css/style.css');

});

app.get('/public/css/bootstrap.min.css',function(req, res){
	res.sendFile(__dirname + '/public/css/bootstrap.min.css');

});

app.get('/public/js/script.js',function(req, res){
	res.sendFile(__dirname + '/public/js/script.js');

});


/***************************************************************************************
* var users = [{
*	name : "",
*	taken : false,
*	online: false,
* }];
* I was planning to use this data structure for keeping my users data
****************************************************************************************/


/****************************************************************************************
* Users Data
*****************************************************************************************/

var allUsers = ["Ron", "Harry", "Hermoinie", "Jon", "Itachi", "Zero", "Lancelot"];
var availableUsers = ["Ron", "Harry", "Hermoinie", "Jon", "Itachi", "Zero", "Lancelot"];
var onlineUsers = {};


/****************************************************************************************
* Sockets associated with different users and message
*****************************************************************************************/

io.sockets.on('connection', function(socket){

	/*****************************************************
	* Initial Emit
	******************************************************/

	io.sockets.emit('all available username', availableUsers);

	/*****************************************************
	* Current User Data
	******************************************************/

	socket.on('current user', function(data, callback){
		socket.currentuser = data;
		availableUsers.splice(availableUsers.indexOf(socket.currentuser), 1);
		onlineUsers[socket.currentuser] = socket;
		sendAllOnlineUsers();
	});

	/*****************************************************
	* Private Message Socket
	******************************************************/

	socket.on('private message', function(data, callback){
		var msg = data.msg.trim();
		var reciever = data.user;

		if ( msg !== '' ) {
			
			callback(false);
			onlineUsers[data.user].emit('whisper', {msg : msg, user : socket.currentuser});

		} else {
			callback("Error! Please enter a message");
		}
		
	});



	/*****************************************************
	* Emit data to all users
	******************************************************/

	function sendAllOnlineUsers() {

		io.sockets.emit('online users', Object.keys(onlineUsers));	

	}

	/*****************************************************
	* Disconnection of a socket or a user
	******************************************************/

	socket.on('disconnect', function(data) {
		if (!socket.currentuser) {
			return;
		} else {

			delete onlineUsers[socket.currentuser];

			availableUsers.push(socket.currentuser);

			sendAllOnlineUsers();
		}
	});
});