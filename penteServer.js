///
//
//
/// Starting on a server model, playing first

function penteServer( ) {
    var app    = require('express')();
    var http   = require('http').Server(app);
    var io     = require('socket.io')(http);


    app.get('/', function(req, res) {

        res.send("<h1>HELLLOOOOO</h1>");
        console.log("france");

    });
    app.get('/potato', function(req, res) {
        res.send("YOu got a potato");
        console.log(req);
    });

    app.get('/index.html', function(req, res) {
        res.sendFile(__dirname + '/userView.html');
        console.log("user access");
    });
    io.on('connection', function(socket) {
        console.log("new connection on socket");
    });

    http.listen(3050);

} penteServer( );