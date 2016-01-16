//
//
//
//
//
function PenteControlObject( parentId ) {

    this.view = new ViewObject(this, parentId, viewName);
    
}
PenteControlObject.prototype.getGameState = function( ) {

}
//returns a chat log that is impersistent throughout room
// leaves (cached locally)
PenteControlObject.prototype.getChatLog   = function( ) {

}