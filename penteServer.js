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

            payload = JSON.parse(payload);
            console.log(typeof(payload.passPhrase));
            if( typeof( openGames[payload.roomName] ) !== "undefined" && openGames[payload.roomName].numberPlaying() < 2) {

                if(openGames[payload.roomName].passPhrase === payload.passPhrase){
                    console.log( this );
                    openGames[payload.roomName].addPlayer( payload.playerId );
                    this.join( payload.roomName );
                } else {
                    this.emit('join-error', "Wrong passPhrase!");
                }
                console.log( openGames );

            } else if(typeof(openGames[payload.roomName]) !== "undefined"
                && openGames[payload.roomName].numberPlaying >= 2) {
            
                this.emit('join-error', "Too many playing in that room!");

            } else {
                openGames[payload.roomName] = new GameState( payload.roomName, payload.playerId );
                this.emit('join room', JSON.stringify( { roomName: payload.roomName } ) );

                if( typeof(payload.passPhrase) !== 'undefined' && payload.passPhrase.length > 0) {
                    openGames[payload.roomName].setPassPhrase(payload.passPhrase);
                    this.join( payload.roomName );
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
    } else if(this.playerTwo.length === 0 || typeof(this.playerTwo.length) === 'undefined') {
        this.playerTwo = playerName;
    }
}
//@TODO this is always returning two, preventing you from
//  testing other functionality
GameState.prototype.numberPlaying = ( ) => {
    var numPlaying = 0;
    if( typeof(this.playerOne) !== 'undefined') numberPlaying += 1;
    if( typeof(this.playerTwo) !== 'undefined') numberPlaying += 1;
    return numPlaying;
}
GameState.prototype.setPassPhrase = ( passIn ) => {
    this.passPhrase = passIn;
}
GameState.prototype.validateMove  = ( moveIn ) => {

}