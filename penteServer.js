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

    app.get('/pente.css', function(req, res) {
        res.sendFile(__dirname + '/pente.css');
        console.log("css served");
    });

    io.on('connection', function(socket) {

        console.log("new connection on socket");
        socket.on('disconnect', function() {
            //ask the room who is still there
            console.log("disconnect from: " + socket._CURRENTROOM);
            if(typeof(socket._CURRENTROOM) !== 'undefined'){
                if(openGames[socket._CURRENTROOM].getNumberPlaying(openGames[socket._CURRENTROOM]) < 2) {
                    delete openGames[socket._CURRENTROOM];
                } else {
                    io.to(socket._CURRENTROOM).emit('_REQPRESENCE', undefined);
                }
            }
        });
        socket.on('client_present', function(data) {
            openGames[data.roomName].playerLeave(!data.myTurn, openGames[data.roomName]);
            io.to(data.roomName).emit('_PLAYERLEFT', openGames[data.roomName]);
        })
        //whenever one requests a room list, we can send
        // to all ....kinda super exploitable though...
        // @todo find a more robust solution
        socket.on('list_rooms', function( data ) {
            sendRoomList(io, openGames);
        });

        socket.on('leave_room', function( data ) {
            console.log("Room Left: " + data.roomName);
            openGames[data.roomName].playerLeave(data.myTurn, openGames[data.roomName]);
            io.to(data.roomName).emit('_PLAYERLEFT', openGames[data.roomName]);
            this.leave(data.roomName);
            sendRoomList(io, openGames);
        });    

        socket.on('play_made', function(payload) {
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
        socket.on('new_game', function(payload) {
            console.log('new_game called');
            openGames[payload.roomName].resetGame( openGames[payload.roomName] );
            io.to(payload.roomName).emit('_NEWGAME', openGames[payload.roomName] );
        });
        socket.on('join_room', function(payload) {

            
            console.log( typeof(payload.passPhrase) );
     
            if( typeof( openGames[payload.roomName] ) !== "undefined" && openGames[payload.roomName].numberPlaying() < 2) {
                socket._CURRENTROOM = payload.roomName;
                if(openGames[payload.roomName].passPhrase === payload.passPhrase){
                    

                    var payloadOut = openGames[payload.roomName];
                    payloadOut.myTurn = openGames[payload.roomName].addPlayer( payload.playerId, openGames[payload.roomName] );

                    this.join( payload.roomName );
                    io.to(payload.roomName).emit('_JOINROOM', payloadOut );

                } else {

                    io.to(payload.roomName).emit('_JOINERROR', "Wrong passPhrase!");

                }

            } else if(typeof(openGames[payload.roomName]) !== "undefined"
                && openGames[payload.roomName].numberPlaying >= 2) {
            
                io.to(payload.roomName).emit('_JOINERROR', "Too many playing in that room!");

            } else {
                socket._CURRENTROOM = payload.roomName;
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

function sendRoomList( ioObject, gamesObject ) {
    var roomList = generateRoomList(gamesObject);
    ioObject.emit("_ROOMLIST", roomList);
}
function generateRoomList( openGames ) {

    var roomList      = [];
    var numberPlaying = 0;
    for( room in openGames ) {
        numberPlaying = openGames[room].getNumberPlaying(openGames[room]);
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
    return roomList;
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
GameState.prototype.initiatePlays = ( caller ) => {
    caller.plays = [];
    for(var i = 0; i < caller.gridSize; i += 1) {
        caller.plays.push([]);
        for(var j = 0; j < caller.gridSize; j += 1) {
            caller.plays[i].push( 0 );
        }
    }
}
GameState.prototype.addPlayer = ( playerName, caller ) => {
    var myTurn = false; //return value to indicate where player should be turning
    if( typeof(caller.playerOne) === 'undefined' || caller.playerOne.length === 0 ) {
        caller.playerOne = playerName;
        myTurn = true;
    } else if( typeof(caller.playerTwo) === 'undefined' || caller.playerTwo.length === 0 ) {
        caller.playerTwo = playerName;
        myTurn = false;
    }
    return myTurn;
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
    mutator.passPhrase = passIn;
}
GameState.prototype.makePlay      = ( payload, caller ) => {
    caller.plays[payload.x][payload.y] = (caller.whosTurn) ? 1 : 2;
}
GameState.prototype.checkVictory  = ( payload, caller) => {
    var didWin = false;
    var pX = payload.x;
    var pY = payload.y;
    var player = ( caller.whosTurn === true ) ? 1 : 2;
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
        if( pYpass && pXpass &&
            otherP  === caller.plays[pX+dirRight*1][pY+dirUp*1] &&
            otherP  === caller.plays[pX+dirRight*2][pY+dirUp*2] &&
            player  === caller.plays[pX+dirRight*3][pY+dirUp*3] ) {
                isCapture = true;
                removeCapture( [pX+dirRight*1, pY+dirUp*1],
                    [pX+dirRight*2,pY+dirUp*2]);
        }
        return isCapture;
    }
    function removeCapture(token1, token2) {
        caller.plays[token1[0]][token1[1]] = 0;
        caller.plays[token2[0]][token2[1]] = 0;
    }
    function registerCapture( player ) {
        if(     player === 1 ) { 
            return ++caller.captures.playerOne; 
        }
        else if(player === 2 ) { 
            return ++caller.captures.playerTwo; 
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
GameState.prototype.getNumberPlaying = ( caller ) => {
    var number = 0;
    if(caller.playerOne.length > 0 ) number += 1;
    if(caller.playerTwo.length > 0 ) number += 1;
    return number;
}
GameState.prototype.playerLeave = ( myTurnBool, caller ) => {
    if(myTurnBool === true) {
        caller.playerOne = '';
    } else {
        caller.playerTwo = '';
    }
    caller.initiatePlays( caller );
    caller.whosTurn = !myTurnBool;
    caller.captures = { playerOne: 0, playerTwo: 0 };
}

GameState.prototype.resetGame = ( caller ) => {
    caller.initiatePlays( caller );
    caller.captures = { playerOne: 0, playerTwo: 0 };
    caller.whosTurn = !caller.whosTurn; //Loser of last game goes first
}