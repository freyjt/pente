///
//
//
/// Starting on a server model, playing first

function penteServer( ) {
    var app       = require('express')();
    var http      = require('http').Server(app);
    var io        = require('socket.io')(http);
    //without a database we can keep games open
    var openGames = {};
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

        socket.on('play made', function(payload) {
            console.log( JSON.parse(payload) );
        });

        socket.on('room join', function(payload) {
            var info = JSON.parse(payload);
            if(typeof(openGames[info.gameRoom]) !== "undefined"
                && openGames[info.gameRoom].numberPlaying < 2) {
                openGames[info.gameRoom].addPlayer( info.playerId );
            } else if(typeof(openGames[info.gameRoom]) !== "undefined"
                && openGames[info.gameRoom].numberPlaying >= 2) {
            
                this.emit('error', "Too many playing in that room!");

            } else {
                openGames[info.gameRoom] = new GameState( info.gameRoom, info.playerId );
            }
        });

    });

    http.listen(3050);

} penteServer( );

function GameState( roomName, player1) {
    this.roomName   = roomName;
    this.playerOne  = player1;
    this.whosTurn   = true; //easier to flip
    this.
}
GameState.prototype.addPlayer = ( playerName ) => {
    if(typeof(this.playerOne) === 'undefined') {
        this.playerOne = playerName;
    } else if(typeof(this.playerTwo) === 'undefined') {
        this.playerTwo = playerName;
    }
}