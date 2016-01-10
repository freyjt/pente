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
            console.log(payload);
            var payload = JSON.parse(payload);
            console.log("::" + payload);
            console.log("roomName    " + payload.roomName);

            if(typeof(openGames[payload["roomName"]]) !== "undefined"
                && openGames[payload.roomName].numberPlaying < 2) {

                if(openGames[payload.roomName].passPhrase === payload.passPhrase){
                    openGames[payload.roomName].addPlayer( payload.playerId );
                } else {
               //     socket.emit('join-error', "Wrong passPhrase!");
                }
                console.log( openGames );
            } else if(typeof(openGames[payload.roomName]) !== "undefined"
                && openGames[payload.roomName].numberPlaying >= 2) {
            
              //  socket.emit('join-error', "Too many playing in that room!");

            } else {
                openGames[payload.roomName] = new GameState( payload.roomName, payload.playerId );
                
                if(typeof(payload.passPhrase) !== 'undefined'
                    && payload.passPhrase.length > 0) {
                    openGames[payload.roomName].setPassPhrase(payload.passPhrase);
                }

                console.log(openGames);
            }
        });

    });

    http.listen(3050);

} penteServer( );



function GameState( roomName, player1) {
    this.roomName   = roomName;
    if(typeof(player1) !== 'undefined')
        this.playerOne  = player1;
    else this.playerOne = "player1";
    this.playerTwo  = "";
    this.whosTurn   = true; //easier to flip
    this.passPhrase = "";
}
GameState.prototype.addPlayer = ( playerName ) => {
    if(typeof(this.playerOne) === 'undefined') {
        this.playerOne = playerName;
    } else if(typeof(this.playerTwo) === 'undefined') {
        this.playerTwo = playerName;
    }
}
GameState.prototype.setPassPhrase = ( passIn ) => {
    this.passPhrase = passIn;
}
GameState.prototype.validateMove  = ( moveIn ) => {

}