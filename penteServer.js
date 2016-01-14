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
        //whenever one requests a room list, we can send
        // to all ....kinda super exploitable though...
        // @todo find a more robust solution
        socket.on('list_rooms', function( data ) {
            var roomList = generateRoomList(openGames);
            io.emit("_ROOMLIST", roomList);
        })
        socket.on('play_made', function(payload) {
            console.log( payload );
            var gameObject = openGames[payload.roomName];
            var collides = gameObject.checkCollision(payload, gameObject);
            if(!collides) {
                gameObject.makePlay( payload, gameObject);

                var win = gameObject.checkVictory( payload, gameObject );

                if(!win) {
                    gameObject.changePlayers( gameObject );
                    io.to(payload.roomName).emit('_GOODPLAY', openGames[payload.roomName] );
                } else {
                    io.to(payload.roomName).emit('_GAMEOVER', openGames[payload.roomName] );
                }
            } else {
                io.to(payload.roomName).emit('_PLAYERROR', openGames[payload.roomName]);
            }
        });

        socket.on('join_room', function(payload) {

            
            console.log( typeof(payload.passPhrase) );
     

            if( typeof( openGames[payload.roomName] ) !== "undefined" && openGames[payload.roomName].numberPlaying() < 2) {

                if(openGames[payload.roomName].passPhrase === payload.passPhrase){
                    openGames[payload.roomName].addPlayer( payload.playerId, openGames[payload.roomName] );

                    var payloadOut = openGames[payload.roomName];
                    payloadOut.myTurn = false;

                    this.join( payload.roomName );
                    io.to(payload.roomName).emit('_JOINROOM', payloadOut );

                } else {

                    io.to(payload.roomName).emit('_JOINERROR', "Wrong passPhrase!");

                }
                console.log( openGames );

            } else if(typeof(openGames[payload.roomName]) !== "undefined"
                && openGames[payload.roomName].numberPlaying >= 2) {
            
                io.to(payload.roomName).emit('_JOINERROR', "Too many playing in that room!");

            } else {
                console.log("first: " + payload.passPhrase);
                openGames[payload.roomName] = new GameState( payload.roomName, payload.playerId );
                var payloadOut = openGames[payload.roomName];
                    payloadOut.myTurn = true;
                this.join( payload.roomName );
                

                if( typeof(payload.passPhrase) !== 'undefined' && payload.passPhrase.length > 0) {
                    openGames[payload.roomName].setPassPhrase(payload.passPhrase, openGames[payload.roomName]);
                    
                }
                io.to(payload.roomName).emit('_JOINROOM', payloadOut );
                console.log("Room created: " + payload.roomName);
            }
        });

    });

    http.listen(3050);

} penteServer( );


function generateRoomList( openGames ) {

    var roomList      = [];
    var numberPlaying = 0;
    for( room in openGames ) {
        numberPlaying = openGames[room].getNumberPlaying( );
        //////
        //@@@@@@@TODO
        //WE'RE CLEARING OUT DEAD WOOD HERE, THAT'S KINDA A TERRIBLE
        // PLACE TO DO THAT. FIX IT.
        if( numberPlaying == 0 ) delete openGames[room];
        else
            roomList.push( 
                {   roomName:      openGames[room].roomName,
                    numberPlaying: numberPlaying
                });
    }

}


function GameState( roomName, player1) {
    this.gridSize   = 20;
    this.roomName   = roomName;
    if(typeof(player1) !== 'undefined')
        this.playerOne  = player1;
    else this.playerOne = "player1";
    this.playerTwo  = "";
    this.whosTurn   = true; //easier to flip
    this.passPhrase = "";
    //using an array here because of significantly
    //  faster win condition lookup
    this.plays  = [];
    this.initiatePlays(this);
    this.captures = {
        playerOne: 0,
        playerTwo: 0
    }
}
GameState.prototype.initiatePlays = (caller ) => {
    caller.plays = [];
    for(var i = 0; i < caller.gridSize; i += 1) {
        caller.plays.push([]);
        for(var j = 0; j < caller.gridSize; j += 1) {
            caller.plays[i].push( 0 );
        }
    }
}
GameState.prototype.addPlayer = ( playerName, caller ) => {

    if( typeof(caller.playerOne) === 'undefined' || caller.playerOne.length === 0 ) {
        caller.playerOne = playerName;
    } else if( typeof(caller.playerTwo) === 'undefined' || caller.playerTwo.length === 0 ) {
        caller.playerTwo = playerName;
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
GameState.prototype.setPassPhrase = ( passIn, mutator) => {
    console.log( this );
    mutator.passPhrase = passIn;
}
GameState.prototype.makePlay      = ( payload, caller ) => {
    caller.plays[payload.x][payload.y] = (caller.whosTurn) ? 1 : 2;
}
GameState.prototype.checkVictory  = ( payload, caller) => {
    var didWin = false;
    var pX = payload.x;
    var pY = payload.y;
    var player = ( this.whosTurn ) ? 1 : 2;
    var otherP = ( player === 1  ) ? 2 : 1;
    //check if 5 in a row
    var downDiag = 1;
    var upDiag   = 1;
    var horizon  = 1;
    var vertical = 1;
    var i;
    // this is not beautiful, but we want to 
    //  keep it open until we stop, so for loops!
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX-i][pY-i] === player )
            downDiag += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX+i][pY+i] === player )
            downDiag += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX-i][pY+i] === player )
            upDiag += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX+i][pY-i] === player )
            upDiag += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX-i][pY  ] === player )
            horizon += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX+i][pY  ] === player )
            horizon += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX  ][pY-i] === player )
            vertical += 1;
        else break;
    }
    for(i = 1; i < 5; i++) {
        if(caller.plays[pX  ][pY+i] === player)
            vertical += 1;
        else break;
    }
    if( downDiag >= 5 ||
        upDiag   >= 5 ||
        horizon  >= 5 ||
        vertical >= 5 ) {
            didWin = true;
    }else { //*************************************
        //END check if 5 in a row

        //check if capture
        var capCount = 0;
        var cap      = false;
        for(i = -1; i <= 1; i++) {
            for(j = -1; j <= 1; j++) {
                cap = false;
                if(!(j === 0 && i === 0)) {
                    cap = capture(i, j);
                    if( cap ) {
                        capCount = registerCapture(player);
                    }
                }
            }
        }
    }
    if( capCount >= 5 ) {
        didWin = true;
    }
    // 0, 1, -1
    function capture(dirUp, dirRight) {
        var isCapture = false;
        var pYpass = (dirUp    < 0) ? pY >= 3 : true;
            pYpass = (dirUp    > 0) ? pY < caller.gridSize - 3: true;
        var pXpass = (dirRight < 0) ? pX >= 3 : true;
            pXpass = (dirRight < 0) ? pX < caller.gridSize - 3: true;
        console.log("****@*@*@**@*@*@*@**");
        if( pYpass && pXpass &&
            otherP  === caller.plays[pX+dirRight*1][pY+dirUp*1] &&
            otherP  === caller.plays[pX+dirRight*2][pY+dirUp*2] &&
            player  === caller.plays[pX+dirRight*3][pY+dirUp*3] ) {
                isCapture = true;
                console.log("*************_______*********");
                removeCapture( [pX+dirRight*1, pY+dirUp*1],
                    [pX+dirRight*2,pY+dirUp*2]);
        }
        return isCapture;
    }
    function removeCapture(token1, token2) {
        caller.plays[token1.x][token1.y] = 0;
        caller.plays[token2.x][token2.y] = 0;
    }
    function registerCapture( playerNumber ) {
        if(     playerNumber == 1 ) { 
            return caller.captures.playerOne += 1; 
        }
        else if(playerNumber == 2 ) { 
            return caller.captures.playerTwo += 1; 
        }
    }
    return didWin;
}
GameState.prototype.changePlayers  = ( caller ) => {
    caller.whosTurn = !caller.whosTurn;
}
GameState.prototype.checkCollision = ( payloadObject, caller ) => {
    var collides = false;
    if( caller.plays[payloadObject.x][payloadObject.y] !== 0) {
        collides = true;
    }
    return collides;
}
GameState.prototype.getNumberPlaying = ( ) => {
    var number = 0;
    if(this.playerOne.length > 0 ) number += 1;
    if(this.playerTwo.length > 0 ) number += 2;
    return number;
}
GameState.prototype.playerLeave = ( objectWithMyTurnBool ) => {
    if(objectWithMyTurnBool.myTurn === true) {
        this.playerOne = '';
    } else {
        this.playerTwo = '';
    }
    this.initiatePlays( );
}