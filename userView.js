
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
        console.log(pos);
        pos = registrantThis.transMouseToGrid( pos, registrantThis);
        console.log( pos );

        registrantThis.control.renderView( pos, registrantThis.control);
        

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
UserView.prototype.renderText = (textString) => {

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


    } 
}
UserView.prototype.drawToken        = ( tokenIn, color) => {
    var center = this.getDrawCenter( tokenIn );
    this.context.fillStyle   = (typeof(color) === 'string') ? color : "#000000";
    this.context.strokeStyle = "#000000";
    this.context.lineWidth   = 3;
    this.context.beginPath()
                .arc(center.x, center.y, this.gameTokenRad, 0, 2*Math.PI)
                .stroke()
                .fill();
}
UserView.prototype.getDrawCenter = ( tokenIn ) => {
    if( tokenIn instanceof gameToken ) {
        tokenIn = tokenIn.getPosition();
    }
    var xVal = this.startX + tokenIn.x * this.gridSize;
    var yVal = this.startY + tokenIn.y * this.gridSize;
    return {x: xVal, y: yVal};
}
UserView.prototype.transMouseToGrid = ( mouse, caller) => {

    var halfGrid = caller.gridSize / 2;
    //caller is true iff we have a square board @TODO we need to offset
    //  mouse and size?
    var X = Math.floor( caller.gridCount * (mouse.x + halfGrid) / caller.sizeX);
    var Y = Math.floor( caller.gridCount * (mouse.y + halfGrid) / caller.sizeY);
    console.log( mouse.x + " : " + X );
    return {x: X, y: Y};
}



function UserControl(   ) {
    this.view  = new UserView( 'gameCanvas', this);
    this.model = new UserModel(  );
    this.io    = io();
    var this_closure = this;

    this.io.on('connection', function(socket) {

        socket.on('play made', function( newState ) {

            this_closure.model.update( newState );
            this_closure.view.render( this_closure.model.getMoves() );

        });

    });

    this.renderView(undefined, this);
}
UserControl.prototype.renderView = ( newMove, origin ) => {
    //check for colisions with model
    console.log(origin);
    var moves = origin.model.getMoves( );

    if(typeof(newMove) !== 'undefined') {
        const moveCollides = origin.checkCollisions(moves, newMove);
        if( !moveCollides )  origin.view.render(moves, newMove, origin.view );
        else origin.view.renderText("You can't move there!");
    } else {
        origin.view.render(moves, undefined, origin.view);
    }
}
UserControl.prototype.checkCollisions = ( moves, newMove ) => {
    var doesCollide = false
    if(typeof(moves) !== 'undefined'){
        for(var i = 0; i < moves.length; i++) {
            if(typeof(moves[i]) !== 'undefined') {
                for(var j = 0; j < moves[i].length; j++) {
                    if( newMove.x === moves[i][j].x && newMove.y === moves[i][j].y ){
                        doesCollide = true;
                        break;
                    }
                }
            }
        }
    }
    return doesCollide;
}


function UserModel(  ) {
    this.playerOne = []; //list of moves
    this.playerTwo = [];
}
UserModel.prototype.getMoves = (  ) => {
    return [ this.playerOne, this.playerTwo ];
}

function GameToken( xyObjectIn ) {

    this.x = 0;
    this.y = 0;

    if( typeof( xyObjectIn) !== 'undefined' ) {
        try {
            if(typeof( xyObjectIn.x) !== 'undefined' &&
                typeof( xyObjectIn.y) !== 'undefined') {
                this.x = xyObjectIn.x;
                this.y = xyObjectIn.y;
            } else {
                throw "assignError";
            }
        }
        catch (err) {
            console.log("Bad assignment in gameToken constructor.")
        }
    }

}
GameToken.prototype.setPosition = ( xyObjectIn ) => {
    if( typeof( xyObjectIn) !== 'undefined' ) {
        try {
            if(typeof( xyObjectIn.x) !== 'undefined' &&
                typeof( xyObjectIn.y) !== 'undefined') {
                this.x = xyObjectIn.x;
                this.y = xyObjectIn.y;
            } else {
                throw "assignError";
            }
        }
        catch(err) {
            console.log("Bad assignment in gameToken setLocation.")
        }
    }
}
GameToken.prototype.getPosition = ( ) => { return {x: this.x, y: this.y}; }






window.onload = function( ) {
    var cont = new UserControl();
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