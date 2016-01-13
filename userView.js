
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
    this.gridColor    = "#000000";

    var registrantThis = this;
    this.canvas.addEventListener("mousemove", function(evt) {

        pos = getMousePosition(evt);
        pos = registrantThis.transMouseToGrid( pos, registrantThis);
        registrantThis.control.renderView( pos, registrantThis.control);
        

    });
    this.canvas.addEventListener("mousedown", function(evt) {
        pos = getMousePosition(evt);
        pos = registrantThis.transMouseToGrid( pos, registrantThis);
        registrantThis.control.makeMove( pos, registrantThis.control );
    });
}

//get dots from control
// package model on server ;)
UserView.prototype.render  = ( dots, turnDot, caller ) => {

    caller.context.fillStyle = caller.bgColor;
    caller.context.fillRect(0, 0, caller.sizeX, caller.sizeY);

    caller.drawGrid( caller );
    caller.drawDots( dots, turnDot );

}
UserView.prototype.renderText = (textString, status, caller) => {
    caller.context.globalAlpha = .5;
    caller.context.fillStyle = 'red';
    caller.context.fillRect(0,0, caller.sizeX, caller.sizeY);
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
UserView.prototype.drawDots = function( dots, playerMove ) {

    //dots is an object of lists of xy objects
    if( typeof(dots) !== 'undefined' ) {
        this.context.beginPath();
        for(var i = 0; i < dots.length; i++) {
            this.context.fillStyle = this.playerColors[i];
            if(typeof(dots[i]) !== 'undefined')
                for(var j = 0; j < dots[i].length; j++) {
                    this.drawToken( dots[i][j] );
                }
        }
    }
    if( typeof(playerMove) !== 'undefined' ) {

        this.drawToken( playerMove, undefined, this);

    } 
}
UserView.prototype.drawToken        = ( tokenIn, color, caller) => {
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
    if( tokenIn instanceof GameToken ) {
        tokenIn = tokenIn.getPosition();
    }
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






function UserControl(   ) {
    this.view  = new UserView( 'gameCanvas', this);
    this.model = new UserModel(  );
    this.roomName = "";
    this.io    = io( );

    this.setupSocketHandlers( this );
    var rescope_this = this;
    //Really affecting binding here soooo....do better
    var join_button = document.getElementById('roomJoin');

    join_button.onclick = function(evt) {
        var payload        = {};
        payload.roomName   = document.getElementById('whichRoom').value;
        if( payload.roomName.length > 0) {
            payload.passPhrase = document.getElementById('passPhrase').value;
            rescope_this.packageAndShip('join_room', payload, rescope_this );
        } else {
            document.getElementById('whichRoom').value = "Must select room name.";
        }
        
    }

    this.renderView(undefined, this);
}
UserControl.prototype.renderView = ( newMove, caller ) => {
    //check for colisions with model

    var moves = caller.model.getMoves( );

    if(typeof(newMove) !== 'undefined') {
        const moveCollides = caller.model.checkCollisions( newMove );
        if( !moveCollides )  caller.view.render(moves, newMove, caller.view );
        else caller.view.renderText("You can't move there!");
    } else {
        caller.view.render(moves, undefined, caller.view);
    }
}
UserControl.prototype.setRoomName = ( nameIn, caller ) => {
    caller.roomName = nameIn;
}
UserControl.prototype.makeMove = (movePlacement, caller) => {
    //check if it's your turn
    var yourTurn = caller.model.getYourTurn( );
    if( yourTurn ) {
        var collision = caller.model.checkCollisions( movePlacement );
        if( !collision ) {
            caller.packageAndShip("play_made", movePlacement, caller);
        } else {
            caller.view.renderText("Illegal move!", "error", caller.view);
        }
    } else {
        caller.view.renderText("It's not your turn!", 'error', caller.view);
    }
}
UserControl.prototype.packageAndShip = ( event, payload, controlObject ) => {
    if(typeof(payload.roomName) === 'undefined')
        payload.roomName = controlObject.roomName;
    controlObject.io.emit(event, payload );
}
UserControl.prototype.setupSocketHandlers = (  caller ) => {

        caller.io.on('_PLAYMADE', function( data ) {
            caller.model.update( data );
            caller.view.render( caller.model.getMoves() );
        });
        caller.io.on('_GAMEOVER'), function( data ) {
            if( data.whosTurn && data.playerOne == caller.model.getMyName() ) {

            }
            caller.view.renderText("You Win!", "end_of_game", caller.view);
        }

        caller.io.on('_JOINROOM', function( data) {
            console.log(data.roomName);
            caller.setRoomName( data.roomName, caller );
        });

        caller.io.on('_JOINERROR', function(  error ) {
            console.log(error);
            caller.view.renderText( error );
        });

}


//Initialize a new game with the model object from
// server on _JOINROOM (or _NEWGAME when it exists) event
function UserModel( modelIn ) {
    //if the instantiating player is the first in the room
    // the will go when whosTurn is true; else they are the 
    // second in the room and will go when whosturn is fals
    // This should be more robust to allow for changing first move
    this.myTurn    = (modelIn.playerTwo.length > 0) ? false : true;

    this.roomName  = null;
    this.playerOne = null;
    this.playerTwo = null;
    this.whosTurn  = null;
    this.plays     = null;
    this.captures  = null;
    this.updateModel( modelIn );

    //idea vars
    this.gamesOne    = 0;
    this.gamesPlayed = 0;
    this.score       = {playerOne: 0, playerTwo: 0};

}
UserModel.prototype.getMoves = (  ) => {
    return this.plays;
}
UserModel.prototype.getcaptures = ( ) => {
    return this.captures;
}
UserModel.prototype.updateModel = ( modelIn ) => {
    this.roomName  = modelIn.roomName;
    this.playerOne = modelIn.playerOne;
    this.playerTwo = modelIn.playerTwo;
    this.whosTurn  = modelIn.whosTurn;
    this.plays     = modelIn.plays;
    this.captures  = modelIn.captures;
}
UserModel.prototype.getMyName = () => {
    return this.myName;
}
UserModel.prototype.getYourTurn = ( ) => {
    var yourTurn = false;
    if(this.myTurn === this.whosTurn) { yourTurn = true; }
    return yourTurn;
}
UserModel.prototype.checkCollisions = (newMove) => {
    var collides = false;
    if( this.plays[newMove.x][newMove.y] !== 0 ) {
        collides = true;
    }
    return collides;
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