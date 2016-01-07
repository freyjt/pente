
////
///
//   View for displaying a pente game!!!!
////
////
////

function UserView(canID) {
    this.io        = require("socket.io");
    this.canvas    = document.getElementById(canID)
    this.context   = canvas.getContext("2d");
    this.sizeX     = canvas.width;
    this.sizeY     = canvas.height;
    this.gridSpace = ( sizeX < sizeY ) ? sizeX : sizeY;
    this.startX    = (sizeX - gridSpace) / 2;
    this.startY    = (sizeY - gridSpace) / 2;

    this.gridCount = 19;
    this.gridSize  = gridSpace;

    ////dynamizeMe
    this.bgColor      = "#ffffff";
    this.playerColors = ['#ff00ff', '#00ff00'];
    this.gridColor    = "#000000";



}


//get dots from control
// package model on server ;)
UserView.render   = function( dots ) {

    this.context.fillColor = this.bgColor;
    this.context.fillRect(0, 0, this.sizeX, this.sizeY);

    this.drawGrid( );
    this.drawDots( dots );
}


UserView.drawGrid = function(  ) {
    this.context.strokeStyle = this.gridColor;
    this.context.beginPath();
    for(var i = 0; i < gridCount; i++) {
        this.context.moveTo(startX, startY + i * gridSize);
        this.context.lineTo(sizeX - startX, startY + i * gridSize);
        this.context.stroke();

        this.context.moveTo(startX + i * gridSize , startY);
        this.context.lineTo(startX + i * gridSize , sizeY - startY);
        this.context.stroke();
    }
}

UserView.drawDots = function( dots ) {

    //dots is an object of lists of touples
    this.context.beginPath();
    for(var i = 0; i < dots.length; i++) {
        this.context.fillStyle = this.playerColors[i];
        for(var j = 0; j < dots[i].length; j++) {

        }
    }

}



function UserControl(   ) {
    this.io   = require('socket.io');
    this.view = new UserView( );
    this.io.on('connection', function(socket) {

        socket.on('play made', function( dots ) {

            dots = JSON.parse( dots );
            view.render( dots );

        });

    });

}