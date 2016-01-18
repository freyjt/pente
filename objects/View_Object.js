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


function DisplayObject( posX, posY, sizeX, sizeY, container ) {
    this.left   = posX;
    this.top    = posY;
    this.height = sizeY;
    this.width  = sizeX;
    this.container = document.createElement.(container);

    this.bgColor      = 'Beige';
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
DisplayObject.prototype.setBGColor    = function( colorIn ) {
    this.bgColor = colorIn;
}
// register all css with .div-button
DisplayObject.prototype.divAsButton = function(ele, id, sizePCTX, sizePCTY
                                        posPCTX, posPCTY, callBackClick, callBackMove) {
    var buttonWidth    = sizePCTX * parX,
        buttonHeight   = sizePCTY * parY;
    ele.id             = id;
    ele.className     += 'div-button';
    ele.style.position = 'absolute';
    ele.style.top      = posPCTY  * parY;
    ele.style.left     = posP
    ele.width          = buttonWidth;
    ele.height         = 
    if(typeof(callBackClick) !== 'undefined') {
        ele.addEventListener('click', function(evt) {
            callBackClick(evt);
        })
    }
    if(typeof(callBackMove) !== 'undefined') {
        ele.addEventListener('mouseMove', function(evt) {
            callBackMove(evt);
        })
    }

}


function BoardDisplay( posX, posY, sizeX, sizeY, lineCount) { //inherits from display object
    //constructor steals this...left, top, height, width
    DisplayObject.call(this, posX, posY, sizeX, sizeY, 'canvas');
    //using canvas. Need a context
    this.ctx          = this.container.getContext('2d');
    //store the current location of the pointing
    // device on the object. Trigger token move events only on change.
    this.startLeft    = 0; //calculate on render
    this.startTop     = 0; //calculate on render
    this.boardX       = 0;
    this.boardY       = 0;
    this.lineCount    = lineCount;
    this.betweenLines = 0; //calculate on render
    this.tokenRad     = 0; //calculate on render


    this.lineColor    = 'Indigo';
    this.oneColor     = '#0f0f0f';
    this.twoColor     = '#ff00ff';
    this.playColor    = '#aabbcc';

    this.lineWidth    = 2;
    this.outLineWidth = 3;

}
BoardDisplay.prototype = Object.create(DisplayObject.prototype, {
                                        constructor: {
                                            configurable: true,
                                            enumerable:   true,
                                            value:        BoardDisplay,
                                            writeable:    true
                                            };
                                        });

BoardDisplay.prototype.setLineColor  = function( colorIn ) {
    this.lineColor = colorIn;
}
BoardDisplay.prototype.setOneColor    = function(oneColorIn) {
    this.oneColor = oneColorIn;
}
BoardDisplay.prototype.setTwoColor    = function(twoColorIn) {
    this.twoColor = twoColorIn;
}
BoardDisplay.prototype.setPlayerColors = function(oneColorIn, twoColorIn) {
    this.oneColor = oneColorIn;
    this.twoColor = twoColorIn;
}
BoardDisplay.prototype.render = function( sizeX, sizeY, posX, posY, 
                                            plays, newPlay, 
                                            overString, overCode) {
    //setup all the vars for rendering
    this.container.width        = sizeX;
    this.container.height       = sizeY;
    this.container.style.left   = posX;
    this.container.style.top    = posY;

    var minSize    = ( sizeX < sizeY ) ? sizeX ; sizeY;
    this.boardWidth   = .85 * minSize;
    this.startLeft    = (sizeX - boardWidth) / 2;
    this.startTop     = (sizeY - boardWidth) / 2;
    this.lineGap  = this.boardWidth / (this.lineCount - 1);
    this.tokenRad = (this.lineGap - (.1 * this.lineGap)) / 2;

    //do the rendering based on state
    this.renderBackground( ).bind(this);
    this.renderTokens(plays, {this.boardX, this.boardY}).bind(this);

}
BoardDisplay.prototype.renderBackground = function(  ) {
    this.context.fillStyle = this.bgColor;
    this.context.fillRect(0, 0, this.container.width, this.container.height);

    this.context.strokeStyle = this.lineColor;
    this.context.beginPath();
    for(var i = 0; i < this.lineCount; i++) {
        this.context.moveTo(this.startX + i * this.lineGap, this.startY  );
        this.lineTo(this.startX + i * this.lineGap, this.container.height - this.startY);
        this.context.moveTo(this.startX, this.startY + i * this.lineGap);
        this.lineTo(this.container.width - this.startX, this.startY + i * this.lineGap);
    }
    this.context.stroke();
}
BoardDisplay.prototype.renderTokens    = function(plays, localToken) {
    //dots is an object of lists of xy objects
    var posPx = {};
    if(typeof(plays) !== 'undefined') {
        for(var i = 0; i < plays.length; i++ ) {
            for(var j = 0; j < plays[i].length; j++) {
                if( plays[i][j] === 1 ) {
                    posPx = convertPos(i, j); 
                    this.renderToken(posPx.x, posPx.y, this.tokenRad, this.oneColor);
                } else if( plays[i][j] === 2 ) {
                    posPx = convertPos(i, j);
                    this.renderToken(posPx.x, posPx.y, this.tokenRad, this.twoColor);
                }
            }
        }
    }
    if( typeof(localToken) !== 'undefined' ) {
        posPx = convertPos(localToken.x, localToken.y);
        caller.drawToken( posPx, posPy, this.tokenRad, this.playColor);
    }

    function convertPos(x, y) {
        return {x: this.startX + i * this.lineGap, 
                y: this.startY + j * this.lineGap };
    }
}
BoardDisplay.prototype.renderToken     = function(pxX, pxY, rad, color) {
    this.context.fillStyle   = color;
    this.context.lineWidth   = this.outLineWidth; 

    this.context.beginPath();
    this.context.arc(pxX, pxY, rad, 0, 2*Math.PI);

    this.context.fill();
    this.context.stroke();
}
BoardDisplay.prototye.renderText  = function( textString, textCode) {
    if(textCode === 'error') {
        this.context.fillStyle = 'Red';
    } else if( textCode === 'game_end') {
        this.context.fillStyle = 'Grey';
    } else {
        this.context.fillStyle = 'YellowGreen';
    }

    this.context.globalAlpha = .3;
    this.context.fillRect(0,0, this.container.width, this.container.height);
    this.context.globalAlpha =  1;
    var bannerHeight = .2 * this.container.height;
    this.context.fillRect(0, (this.container.height - bannerHeight)/2, 
        this.container.width, bannerHeight); 
    var textHeight   = Math.floor(.15 * this.container.height);
    var textBump     = (.2 - .15) / 2 * this.container.height;
    this.context.fillStyle = this.lineColor;
    this.context.font = textHeight + "pt Arial";
    this.context.fillText(textString, textBump, 
        ( (this.container.height - bannerHeight) / 2 ) + textBump);
}
BoardDisplay.prototype.mouseMove = function( evt ) {
    var xy       = this.getMousePosition( evt );
    var pointerX = (xy.x - this.startLeft) / this.betweenLines;
    var pointerY = (xy.y - this.startTop ) / this.betweenLines;
}

function JoinDisplay(posX, posY, sizeX, sizeY ) {
    DisplayObject.call(this, posX, posY, sizeX, sizeY, 'div');
    this.container.height = sizeX
}
JoinDisplay.prototype = Object.create(DisplayObject.prototype, {
                                        constructor: {
                                            configurable: true,
                                            enumerable:   true,
                                            value:        JoinDisplay,
                                            writeable:    true
                                            };
                                        });
JoinDisplay.prototype.render = function(posX, posY, sizeX, sizeY, joinState) {
    var innerString = "";
    if(joinState.inRoom = true) {
        innerString = this.renderInRoom(sizeX, sizeY);
    }
    this.container.innerHTML = innerString;
}
JoinDisplay.prototype.renderInRoom = function(sizeX, sizeY) {
    var leaveButton = document.createElement()
        leaveButton = setupButton(leaveButton, 'leaveRoom', sizeX, sizeY);


}