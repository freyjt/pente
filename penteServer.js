///
//
//
/// Starting on a server model, playing first

function penteServer( ) {
    var app    = require('express')();
    var http   = require('http').Server(app);
    var io     = require('socket.io')(http);

    app.get('/potato', function(req, res) {
        res.send("YOu got a potato");
        console.log(req);
    });

    //100% of there being a better way to do this
    app.get('/index.html', function(req, res) {
        res.sendFile(__dirname + '/userView.html');
        console.log("user access");
    });
    app.get('/userView.js', function(req, res) {
        res.sendFile(__dirname + '/userview.js');
        console.log("js served");
    });

    io.on('connection', function(socket) {
        console.log("new connection on socket");
    });

    http.listen(3050);

} penteServer( );