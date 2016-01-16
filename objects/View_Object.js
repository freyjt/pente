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
    this.boardCluster.width  = "600px";
    this.boardCluster.height = "600px";


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

}
ViewObject.prototype.renderView = function( cause ) {
    //gather state
    var state = this.control.getGameState( );
    if(state.gameOn === true) {
        this.joinCluster.innerHTML = this.genLeaveRoom( state );


    } else if(state.inRoom === true) {
        this.joinCluster.innerHTML = this.genLeaveRoom( state );
    } else {
        this.joinCluster.innerHTML = this.genJoinRoom( state );
    }
}
ViewObject.prototype.genJOINLeaveRoom = function( state ) {


}
ViewObject.prototype.genJOINJoinRoom  = function( state ) {


}
ViewObject.prototype.genBOARDTextPanel = function( text, state ) {


}
ViewObject.prototype.genBOARDGamePanel = function( moves, newMove) {

}
ViewObject.prototype.genSTATUSCluster  = function( state ) {

}
ViewObject.prototype.genCHATCluster    = function( chatLog ) {

}
ViewObject.prototype.genCOLORPicker    = function( side ) {
    var colorList = ["DarkOrchid", "GreenYellow", "DodgerBlue", "SeaGreen",
                     "Crimson",    "DarkOrange",  "Fuchsia",    "Gold" ];
    var i = 0, j = 0;
    if(this.playerColors.length == 0) {
        var firstColor = colorList[Math.ceil( ( Math.random() * colorList.length) - 1 )]
        this.playerColors[0] = colorList[ firstColor    ];
        this.playerColors[1] = colorList[ firstColor + 1];
    }
    for(i = 0; i < 3; i++ ) {
        for(j = 0; j)
    }
    function attachDiv(posX, posY, color) {

    }
    if(side === 'PlayerOne') {

    }

}