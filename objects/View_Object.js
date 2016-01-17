//
//
//  @pD         - the parent object Id of the view object
//                   needs to be expandable;
//  @vwNmOvrd - the name of this particular game instance.
function PenteViewObject(control, parId ) {
    try{
        if(this.control instanceof PenteControlObject)
            this.control = control;
        else
            throw 'Bad assign'
    } catch(error) { return null; }

    //first we're going to make a view object to contain
    if(typeof(parId) !== 'string') { parId = 'body'; }
    var view = document.createElement('div');
        view.className = "gameContainer";
    this.conName = view.className;
    
    //create containers for clusters
    this.joinCluster   = document.createElement('div');
    this.joinCluster.className = "joinCluster";

    this.boardCluster  = document.createElement('canvas');
    this.boardCluster.className = 'boardCluster';
    this.boardCluster.width     = "600px";
    this.boardCluster.height    = "600px";
    this.boardContext = this.boardCluster.getContext('2d');
    //set internal size of board;
    this.boardSize     = boardSize().bind(this);
    this.boardXYStart  = this.getBOARDXYStart().bind(this);
    this.boardLineCount= 19;
    this.pixelsPerLine = pixelsPerLine().bind(this);
    this.statusCluster = document.createElement('div');
    this.statusCluster.className = 'statusCluster';

    this.chatCluster   = document.createElement('div')
    this.chatCluster.className = "chatCluster";

    view.appendChild(this.joinCluster);
    view.appendChild(this.boardCluster);
    view.appendChild(this.statusCluster);
    view.appendChild(this.chatCluster);
    document.getElementById(parId).appendChild( view );

    this.playerColor = [];

    this._STATEcolorsWho = false; //let be the player who we are
                                    //pick color will determine color
                                    //picker is active
    function boardSize( ) {
        var maxWid = parseInt(this.boardCluster.width);
        var maxHei = parseInt(this.boardCluster.height);
        var minDim = (maxWid < maxHei) ? maxWid : maxHei;

        return minDim - 50;
    }
    function pixelsPerLine( ) {
        return this.boardSize / (this.boardLineCount - 1);
    }
}
PenteViewObject.prototype.renderView = function( cause ) {
    //gather state
    var state = this.control.getGameState( );

    //build chat cluster
    if(this._STATEcolorsWho !== false) {
        this.chatCluster.genCHATcolor( this._STATEcolorsWho )
            .bind(this);
    } else if(state.inRoom !== true) {
        this.chatCluster.genCHATroomList( state.roomList )
            .bind(this);
    } else {
        var chatLog = this.control.getChatLog( );
        this.chatCluster.genCHATchat( chatLog )
            .bind(this);
    }
    //build join cluster
    if(state.gameOn === true) {
        this.joinCluster.innerHTML = this.genLeaveRoom( state );
    } else if(state.inRoom === true) {
        this.joinCluster.innerHTML = this.genLeaveRoom( state );
    } else {
        this.joinCluster.innerHTML = this.genJoinRoom( state );
    }
}
PenteViewObject.prototype.genJOINLeaveRoom = function( state ) {


}
PenteViewObject.prototype.genJOINJoinRoom  = function( state ) {


}
PenteViewObject.prototype.genBOARDTextPanel = function( text, moves, newMove, state ) {

}
PenteViewObject.prototype.genBOARDGamePanel = function( moves, newMove) {

}
PenteViewObject.prototype.genSTATUSCluster  = function( state ) {

}
PenteViewObject.prototype.genCHATchat    = function( chatLog ) {

}

//side is a view state...can probably just set it like so
PenteViewObject.prototype.genCHATColor      = function( side ) {
    var cluster = document.getElementsByClassName('chatCluster')[0];
        cluster.innerHTML = "";

    var colorList = ["DarkOrchid", "GreenYellow", "DodgerBlue", "SeaGreen",
                     "Crimson",    "DarkOrange",  "Fuchsia",    "Gold",
                     "DarkGrey" ];
    var i = 0, j = 0;
    if(this.playerColors.length == 0) {
        var firstColor = colorList[Math.ceil( ( Math.random() * colorList.length) - 1 )]
        this.playerColors[0] = colorList[ firstColor    ];
        this.playerColors[1] = colorList[ firstColor + 1];
    }

    for(i = 0; i < 3; i++ ) {
        for(j = 0; j < 3; j++) {
            if(side === 'playerOne' && i === 0 && j === 0) {
                attachDiv(6 + (98 * i), 6 + (98 * j), this.playerColors[0]);
                attachImg(this.playerColors[0]);
            } else if( side === 'playerTwo' && i === 2 && j === 0) {
                attachDiv(6 + (98 * i), 6 + (98 * j), this.playerColors[1]);
                attachImg( this.playerColors[1] );
            } else {
                if(colorList[0] === this.playerColors[0] 
                    || colorList[0] === this.playerColors[1])
                    colorList.shift();
                attachDiv(6 + (98 * i), 6 + (98 * j), colorList.shift() );
            }
        }
    }
    function attachDiv(posX, posY, color) {
        var appender = document.createElement('div');
        appender.style.position   = 'absolute';
        appender.style.left       = posX + 'px';
        appender.style.top        = posY + 'px';
        appender.style.background = color;
        appender.onclick = function(evt) {
            if( side === playerOne ) {
                this.playerColors[0] = color;
            } else {
                this.playerColors[1] = color;
            }
        }.bind(this);
        cluster.appendChild(appender); //promoted scope. not in love @todo
    }
    function attachImg( idIn ) {
        document.getElementById( idIn ).innerHTML =
            "<img src=\"/images/arrow.png\" height\"92px\" width=\"92px\"/>";
    }
}
//let accept false to leave colorPicker state
PenteViewObject.prototype.changePickerState = function( whichPlayer ) {
    this._STATEcolorsWho = whichPlayer;
}
//mouse events belong to view. Get them and defer immediately to
// control
PenteViewObject.prototype.setUpCanvasObjectEvents = function(  ) {


    this.boardCluster.onMouseMove = function( evt ) {
        var xy = this.getMousePosition(evt);
            xy = {x: xy.x - 25, y: xy.y - 25};

        this.control.handleMouseMoveOnBoard(xy);
    }.bind(this);
    this.boardCluster.onMouseDown = function( evt ) {
        var xy = this.getMousePosition(evt);
        this.control.handleMouseDownOnBoard(xy);
    }.bind(this);

    function mapXYtoGameboard( xyIn ) {
        return {
            x: (xyIn.x - this.boardXYStart.x) / this.pixelsPerLine,
            y: (xyIn.y - this.boardXYStart.y) / this.pixelsPerLine
        };
    }
}
//Moderately expensive for every render. Consider caching
PenteViewObject.prototype.getBOARDXYStart = function( ) {
    return {
        x: (parseInt(this.boardCluster.width)  - this.boardSize) / 2,
        y: (parseInt(this.boardCluster.height) - this.boardSize) / 2
    };
}
////////////////////
//http://www.kirupa.com/html5/getting_mouse_click_position.htm
PenteViewObject.prototype.getMousePosition = function(e) {

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
} //END http://www.kirupa.com/html5/getting_mouse_click_position.htm


function DisplayObject( posX, posY, sizeX, sizeY ) {
    this.left   = posX;
    this.top    = posY;
    this.height = sizeY;
    this.width  = sizeX;
}
DisplayObject.prototype.getMousePosition = function( event ) {
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

function BoardDisplay( posX, posY, sizeX, sizeY) { //inherits from display object
    //constructor steals this...left, top, height, width
    DisplayObject.call(this, posX, posY, sizeX, sizeY);
    //store the current location of the pointing
    // device on the object. Trigger events only on change.
    this.boardX = 0;
    this.boardY = 0;
}
BoardDisplay.prototype = Object.create(DisplayObject.prototype, {
                                        constructor: {
                                            configurable: true,
                                            enumerable:   true,
                                            value:        BoardDisplay,
                                            writeable:    true
                                            };
                                        });