
////
///
//   View for displaying a pente game!!!!
////
////
////

function UserView(canID, initControlObject) {
    this.control   = initControlObject;
    this.canvas    = document.getElementById(canID)
    this.context   = this.canvas.getContext("2d");
    this.sizeX     = parseInt(this.canvas.width );
    this.sizeY     = parseInt(this.canvas.height);
    this.gridSpace = ( this.sizeX < this.sizeY ) ? this.sizeX : this.sizeY;
    this.startX    = (this.sizeX - this.gridSpace) / 2;
    this.startY    = (this.sizeY -this.gridSpace) / 2;

    this.gridCount = 19;
    this.gridSize  = this.gridSpace / this.gridCount;
    this.gameTokenRad = (this.gridSize / 2) - 2;
    ////dynamizeMe
    this.bgColor      = "#ffffff";
    this.playerColors = ['#ff00ff', '#00ff00'];
    this.newMoveColor = "#aabbcc";
    this.gridColor    = "#000000";

    var registrantThis = this;
    this.canvas.addEventListener("mousemove", function(evt) {

        pos = getMousePosition(evt);
        pos = registrantThis.transMouseToGrid( pos, registrantThis);
        registrantThis.control.renderView( pos, registrantThis.control);
        

    });
    this.canvas.addEventListener("mousedown", function(evt) {
        if( registrantThis.control.getInProgress( registrantThis.control ) ){

            pos = getMousePosition(evt);
            pos = registrantThis.transMouseToGrid( pos, registrantThis);
            registrantThis.control.makeMove( pos, registrantThis.control );

        }
    });
}

//get dots from control
// package model on server ;)
UserView.prototype.render  = (turnDot, caller ) => {
    var dots = caller.control.getMoves( caller.control );

    caller.context.fillStyle = caller.bgColor;
    caller.context.fillRect(0, 0, caller.sizeX, caller.sizeY);
    caller.drawGrid( caller );
    caller.drawDots( dots, turnDot, caller );

}
UserView.prototype.renderText = (textString, status, caller) => {
    caller.render( undefined, caller);
    caller.context.globalAlpha = .5;
    caller.context.fillStyle = 'red';
    caller.context.fillRect(0,0, caller.sizeX, caller.sizeY);
    console.log(textString);
    caller.context.globalAlpha = 1.0;
}

UserView.prototype.drawGrid = ( caller ) => {
    caller.context.strokeStyle = caller.gridColor;
    caller.context.lineWidth   = 3; //exaggerated for visibility at the (literal) edge
    caller.context.beginPath();

    for(var i = 0; i < caller.gridCount + 1; i++) {

        caller.context.moveTo(caller.startX,              caller.startY + i * caller.gridSize);
        caller.context.lineTo(caller.sizeX - caller.startX, caller.startY + i * caller.gridSize);
        caller.context.moveTo(caller.startX + i * caller.gridSize , caller.startY);
        caller.context.lineTo(caller.startX + i * caller.gridSize , caller.sizeY - caller.startY);

    }
    caller.context.stroke();
}
//@todo change this to accept a gamestate object
UserView.prototype.drawDots = function( playArr, playerMove, caller ) {

    //dots is an object of lists of xy objects
    if(typeof(playArr) !== 'undefined') {
        for(var i = 0; i < playArr.length; i++ ) {
            for(var j = 0; j < playArr[i].length; j++) {
                if( playArr[i][j] === 1 ) {
                    caller.drawToken({x: i, y: j}, caller.playerColors[0], caller);
                } else if( playArr[i][j] === 2 ) {
                    caller.drawToken({x: i, y: j}, caller.playerColors[1], caller);
                }
            }
        }
    }
    if( typeof(playerMove) !== 'undefined' ) {
        caller.drawToken( playerMove, caller.newMoveColor, this);
    }
}
UserView.prototype.drawToken     = ( tokenIn, color, caller) => {
    var center = caller.getDrawCenter( tokenIn, caller );
    caller.context.fillStyle   = (typeof(color) === 'string') ? color : "#000000";
    caller.context.strokeStyle = "#000000";
    caller.context.lineWidth   = 3;
    caller.context.beginPath()
    caller.context.arc(center.x, center.y, caller.gameTokenRad, 0, 2*Math.PI)
    caller.context.stroke()
    caller.context.fill();
}
UserView.prototype.getDrawCenter = ( tokenIn, caller ) => {
    var xVal = caller.startX + tokenIn.x * caller.gridSize;
    var yVal = caller.startY + tokenIn.y * caller.gridSize;
    return {x: xVal, y: yVal};
}
UserView.prototype.transMouseToGrid = ( mouse, caller) => {

    var halfGrid = caller.gridSize / 2;
    //caller is true iff we have a square board @TODO we need to offset
    //  mouse and size?
    var X = Math.floor( caller.gridCount * (mouse.x + halfGrid) / caller.sizeX);
    var Y = Math.floor( caller.gridCount * (mouse.y + halfGrid) / caller.sizeY);

    return {x: X, y: Y};
}
UserView.prototype.getMyName = ( controller ) => {
    var name = document.getElementById('myName').value;
    if(name.length === 0) {
        name = 'Player';
        document.getElementById('myName').value = name;
    }
    return name;
}
UserView.prototype.getRoomName = ( controller ) => {
    var roomName = document.getElementById('whichRoom').value;
    if(roomName.length === 0) {
        roomName = randomString( 10 );
        document.getElementById('whichRoom').value = roomName;
    }
    return roomName;
}
UserView.prototype.updateTable = ( caller  ) => {
    var joinButton    = document.getElementById('roomJoin');
    var leaveButton   = document.getElementById('roomLeave');
    var newGameButton = document.getElementById('newGame');
    var nameField     = document.getElementById('myName');
    var roomField     = document.getElementById('whichRoom');
    var passField     = document.getElementById('passPhrase');
    var inProgress    = caller.control.getInProgress(caller.control);
    //haven't joined yet
    if(caller.control.model === null) {
        newGameButton.disabled = true;
        leaveButton.disabled = true;
        joinButton.disabled  = false;
        nameField.disabled   = false;
        roomField.disabled   = false;
        passField.disabled   = false;
    } else { //you're in a room
        // newGameButton.disabled = false;
        leaveButton.disabled = false;
        joinButton.disabled  = true;
        nameField.disabled   = true;
        roomField.disabled   = true;
        passField.disabled   = true;
        if(inProgress) {
            if(caller.control.model.whosTurn === true) {
                document.getElementById('PlayerOne').className = "playerTurn";
                document.getElementById("PlayerTwo").className = "";

            } else {
                document.getElementById('PlayerOne').className = "";
                document.getElementById("PlayerTwo").className = "playerTurn";
            }
            newGameButton.disabled = true;
        } else {
            newGameButton.disabled = false;
        }
        var tab = document.createElement('table');
        //@todo, have you just given up entirely?
        var pString = "";
            pString += "<tr>";
            pString += "<td colspan=\"2\">" + caller.control.model.playerOne + "</td></tr>";
            pString += "<tr><td>Caps:</td><td>" + caller.control.model.captures.playerOne + "</td></tr>"
        tab.innerHTML = pString;
        document.getElementById('PlayerOne').innerHTML = "";
        document.getElementById('PlayerOne').appendChild(tab);
        
        tab = document.createElement('table');
        pString = "<tr><td colspan=\"2\">" + caller.control.model.playerTwo + "</td></tr>";
        pString += "<tr><td>Caps:</td><td>" + caller.control.model.captures.playerTwo + "</td></tr>";
        tab.innerHTML  = pString;
        document.getElementById('PlayerTwo').innerHTML = "";
        document.getElementById('PlayerTwo').appendChild(tab);

    }

    document.getElementById('gameRooms').innerHTML = "<tr><td>Games</td><td># playing</td></tr>";
    var rowString = "";
    for( game in caller.control.roomList ) {
        row = document.createElement("tr");
        rowString = "<td>" + caller.control.roomList[game].roomName;
        rowString += "</td><td>" + caller.control.roomList[game].numberPlaying;
        rowString += "</td>";
        row.innerHTML = rowString;
        document.getElementById('gameRooms').appendChild(row);
    }
 
}



function UserControl(   ) {
    this.view  = new UserView( 'gameCanvas', this);
    this.model = null;
    this.roomName = "";
    this.io    = io( );
    this.io.emit('list_rooms', "Initial room request from client.");
    this.roomList = [];
    this.setupSocketHandlers( this );
    var rescope_this = this;
    //Really affecting binding here soooo....do better
    var join_button = document.getElementById('roomJoin');

    join_button.onclick = function(evt) {
        var payload        = {};
        payload.roomName   = rescope_this.view.getRoomName( );
        console.log(payload.roomName);
        if( payload.roomName.length > 0) {
            payload.passPhrase = document.getElementById('passPhrase').value;
            payload.playerId   = rescope_this.view.getMyName( rescope_this);
            rescope_this.packageAndShip('join_room', payload, rescope_this );
            rescope_this.renderView(undefined, rescope_this);
        } else {
            document.getElementById('whichRoom').value = "Must select room name.";
        }
        
    }
    var new_button   = document.getElementById('newGame');
    new_button.onclick = function(evt) {
        var payload = {};
        payload.roomName = rescope_this.view.getRoomName();
        rescope_this.packageAndShip('new_game', payload, rescope_this);
    }
    var leave_button = document.getElementById('roomLeave');
    leave_button.onclick = function(evt) {
        var payload = {};
        payload.roomName = rescope_this.view.getRoomName( );
        payload.myTurn   = rescope_this.model.getMyTurn( rescope_this.model );
        rescope_this.packageAndShip('leave_room', payload, rescope_this);
        rescope_this.model = null;
        rescope_this.renderView(undefined, rescope_this);
    }
    this.renderView(undefined, this);
}
UserControl.prototype.getInProgress= ( caller ) => {
    var inProgress = false;
    if( caller.model !== null)
        inProgress = caller.model.getInProgress( caller.model );
    return inProgress;
}
UserControl.prototype.renderView = ( newMove, caller ) => {
    //check for colisions with model
    caller.view.updateTable(caller.view);
    if(caller.model !== null && caller.model.getInProgress(caller.model) ) {
        if(typeof(newMove) !== 'undefined' && caller.model !== null) {
            var moves = caller.model.getMoves( caller.model );
            const moveCollides = caller.model.checkCollisions( newMove, caller.model );
            if( !moveCollides )  caller.view.render(newMove, caller.view );
            else caller.view.renderText("You can't move there!", "error", caller.view);
        } else {
            caller.view.render(undefined, caller.view);
        }
    }
}
UserControl.prototype.setRoomName = ( nameIn, caller ) => {
    caller.roomName = nameIn;
}
UserControl.prototype.getMoves    = (caller ) => {
    if(caller.model !== null)
        return caller.model.getMoves( caller.model );
    else return undefined;
}
UserControl.prototype.makeMove = (movePlacement, caller) => {
    //check if game is in progress
    if( caller.model !== null ) {
        var gameInProgress = caller.model.getInProgress( caller.model );
        if( gameInProgress ) {
            //check if it's your turn
            var yourTurn = caller.model.getYourTurn( caller.model );
            if( yourTurn ) {
                var collision = caller.model.checkCollisions( movePlacement, caller.model );
                if( !collision ) {
                    caller.packageAndShip("play_made", movePlacement, caller);
                } else {
                    caller.view.renderText("Illegal move!", "error", caller.view);
                }
            } else {
                caller.view.renderText("It's not your turn!", 'error', caller.view);
            }
        }
    } else { console.log("Game not yet begun."); }
}
UserControl.prototype.updateRoomList = ( data, caller ) => {
    caller.roomList = data;
    caller.renderView(undefined, caller );
}
UserControl.prototype.packageAndShip = ( event, payload, controlObject ) => {
    console.log( typeof(payload.roomName) );
    if(typeof(payload.roomName) === 'undefined'){
        console.log( controlObject.model.getRoomName( controlObject.model ) );
        payload.roomName = controlObject.model.getRoomName(controlObject.model);
    }
    controlObject.io.emit(event, payload );
}
UserControl.prototype.setupSocketHandlers = (  caller ) => {

        caller.io.on('_ROOMLIST', function( data) {
            caller.updateRoomList( data, caller);
        })
        caller.io.on('_GOODPLAY', function( data ) {
            caller.model.updateModel( data, caller.model );
            caller.view.render( undefined, caller.view );
        });

        caller.io.on('_GAMEOVER', function( data ) {
            //we don't flip the turn bit on serverSide
            caller.model.updateModel( data, caller.model);
            if( data.whosTurn === caller.model.myTurn ) {
                caller.view.renderText("You Win!", "end_of_game", caller.view);
            } else {
                caller.view.renderText("You Lose!", "end_of_game", caller.view);
            }
            caller.model.endGame( caller.model );
        });

        caller.io.on('_JOINROOM', function( data) {

            if( caller.model === null){
                console.log(caller.model);
                caller.model = new UserModel( data );
            }
            else caller.model.updateModel( data , caller.model);

            caller.renderView(undefined, caller);
            caller.io.emit('list_rooms', "room request from client");
        });

        caller.io.on('_JOINERROR', function(  error ) {
            console.log(error);
            caller.view.renderText( error, 'error', caller.view );
        });

        caller.io.on('_NEWGAME', function(data) {
            console.log(data);
            caller.model.updateModel(data, caller.model);
            caller.model.startGame(caller.model);
            caller.renderView(undefined, caller);
        });

        // on other client disconnect
        caller.io.on('_REQPRESENCE', function(data) {
            var payload = {};
            console.log("Reqest for presence made");
            payload.roomName = caller.view.getRoomName( );
            payload.myTurn   = caller.model.getMyTurn(caller.model);
            caller.io.emit('client_present', payload);
        });

        caller.io.on('_PLAYERLEFT', function(data) {

            var name = caller.model.getOpponentName(caller.model);
            caller.view.renderText(name + ' left!!', 'error', caller.view);
            caller.io.emit('list_rooms', "room request from client");
            caller.model.updateModel(data, caller.model);

            caller.renderView(undefined, caller);
        })
}

//Initialize a new game with the model object from
// server on _JOINROOM (or _NEWGAME when it exists) event
function UserModel( modelIn ) {
    //if the instantiating player is the first in the room
    // the will go when whosTurn is true; else they are the 
    // second in the room and will go when whosturn is fals
    // This should be more robust
    console.log( modelIn );
    this.myTurn    = true;
    //this is the very first instantiation
    this.myTurn    = modelIn.myTurn;
    this.gameOver  = false;


    this.roomName  = null;
    this.playerOne = null;
    this.playerTwo = null;
    this.whosTurn  = null;
    this.plays     = null;
    this.captures  = null;

    this.updateModel( modelIn, this );
    console.log(this);
    //idea vars
    this.gamesOne    = 0;
    this.gamesPlayed = 0;
    this.score       = {playerOne: 0, playerTwo: 0};

}
UserModel.prototype.getMoves = ( caller ) => {
    return caller.plays;
}
UserModel.prototype.getcaptures = ( ) => {
    return this.captures;
}
UserModel.prototype.updateModel = ( modelIn, caller ) => {
    console.log( 'updateModel called');
    caller.roomName  = modelIn.roomName;
    caller.playerOne = modelIn.playerOne;
    caller.playerTwo = modelIn.playerTwo;
    caller.whosTurn  = modelIn.whosTurn;
    caller.plays     = modelIn.plays;
    caller.captures  = modelIn.captures;

}
UserModel.prototype.getMyName = () => {
    return this.myName;
}
UserModel.prototype.getYourTurn = ( caller ) => {
    return caller.myTurn === caller.whosTurn;
}
UserModel.prototype.checkCollisions = (newMove, caller) => {
    return caller.plays[newMove.x][newMove.y] !== 0 ;
}
UserModel.prototype.getInProgress = ( caller ) => {
    return !caller.gameOver;
}
UserModel.prototype.endGame = ( caller ) => {
    caller.gameOver = true;
}
UserModel.prototype.startGame = ( caller ) => {
    caller.gameOver = false;
}
UserModel.prototype.getRoomName = (caller) => {
    return caller.roomName;
}
UserModel.prototype.getMyTurn   = (caller) => {
    return caller.myTurn;
}
UserModel.prototype.getOpponentName = (caller) => {
    if(caller.myTurn === true) {
        return caller.playerTwo;
    } else {
        return caller.playerOne;
    }
}






window.onload = function( ) {
    window.cont = new UserControl();
}


////////////////////
//http://www.kirupa.com/html5/getting_mouse_click_position.htm
function getMousePosition(e) {

    var parentPosition = getPosition(e.currentTarget);
    var xPosition = e.clientX - parentPosition.x;
    var yPosition = e.clientY - parentPosition.y;
    return { x: xPosition, y: yPosition };
    function getPosition(element) {
        var xPosition = 0;
        var yPosition = 0;
          
        while (element) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }
        return { x: xPosition, y: yPosition };
    }
}
//END http://www.kirupa.com/html5/getting_mouse_click_position.htm

//////////////////
//randomstring
function randomString( length ) {
    var abc = "abcdefghijklmnopqrstuvwxyz";
    var stringOut = "";
    for(var i = 0; i < length; i++) {
        stringOut += abc[ Math.floor( Math.random() * abc.length ) ];
    }
    return stringOut;
}

