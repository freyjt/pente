
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

    ////dynamizeMe
    this.bgColor      = "#ffffff";
    this.playerColors = ['#ff00ff', '#00ff00'];
    this.gridColor    = "#000000";

    var registrantThis = this;
    this.canvas.addEventListener("mousemove", function(evt) {

        pos = getMousePosition(evt);
        pos = registrantThis.transMouseToGrid( pos );
        console.log( pos );
    });

}


//get dots from control
// package model on server ;)
UserView.prototype.render  = function( dots, turnDot ) {

    this.context.fillStyle = this.bgColor;
    this.context.fillRect(0, 0, this.sizeX, this.sizeY);

    this.drawGrid( );
    this.drawDots( dots );

}


UserView.prototype.drawGrid = function(  ) {
    this.context.strokeStyle = this.gridColor;
    this.context.lineWidth   = 3; //exaggerated for visibility at the (literal) edge
    this.context.beginPath();

    for(var i = 0; i < this.gridCount + 1; i++) {

        this.context.beginPath();
        this.context.moveTo(this.startX,              this.startY + i * this.gridSize);
        this.context.lineTo(this.sizeX - this.startX, this.startY + i * this.gridSize);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(this.startX + i * this.gridSize , this.startY);
        this.context.lineTo(this.startX + i * this.gridSize , this.sizeY - this.startY);
        console.log( this.gridSize );
        this.context.stroke();

    }
    this.context.stroke();
}

UserView.prototype.drawDots = function( dots, playerMove ) {

    //dots is an object of lists of touples
    if( typeof(dots) !== 'undefined' ) {
        this.context.beginPath();
        for(var i = 0; i < dots.length; i++) {
            this.context.fillStyle = this.playerColors[i];
            for(var j = 0; j < dots[i].length; j++) {
                /*
                    
                    CODE TO DRAW DOTS

                */
            }
        }
    }
    if( typeof(playerMove) !== 'undefined' ) {


    } 
}
UserView.prototype.drawToken        = function( tokenIn ) {

}
UserView.prototype.transMouseToGrid = function( mouse ) {

    var halfGrid = this.gridSize / 2;
    //this is true iff we have a square board @TODO we need to offset
    //  mouse and size?
    var X = Math.floor( this.gridCount * (mouse.x + halfGrid) / this.sizeX);
    var Y = Math.floor( this.gridCount * (mouse.y + halfGrid) / this.sizeY);

    return {x: X, y: Y};
}

function UserControl(   ) {

    this.view = new UserView( 'gameCanvas', this);
    this.view.render( );
    this.io   = io();
    this.io.on('connection', function(socket) {

        socket.on('play made', function( dots ) {

            this.dots = JSON.parse( dots );
            view.render( this.dots );

        });

    });

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
GameToken.prototype.setLocation = ( xyObjectIn ) => {
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
GameToken.prototype.getLocation = ( ) => { return {x: this.x, y: this.y}; }



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