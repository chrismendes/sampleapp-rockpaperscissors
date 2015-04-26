window.App = window.App || {};

window.App.RockPaperScissorsModel = (function() {

  'use strict'


  // Helper Constants
  var PLAYER_LEFT = 0;
  var PLAYER_RIGHT = 1;
  var DRAW = -1;


  function Model() {

    this.objects = [
      { name: 'rock',     losesTo: [ 'paper' ] },
      { name: 'paper',    losesTo: [ 'scissors' ] },
      { name: 'scissors', losesTo: [ 'rock' ] }
    ];

    this.score = [];
    this.playerWins = [0, 0];
    this.bestOutOf = 5;
    this.userObjectString = null;
    this.selectedObjects = [ null, null ];
    this.result = null;

  }


  /**
  * Establish chosen objects for both players, compare and score
  */
  Model.prototype.playRound = function() {
    if(this.result === null) {

      if(this.selectedObjects[PLAYER_LEFT] === null) {
        this.selectedObjects[PLAYER_LEFT] = this.getComputerPickedObject();
      }
      this.selectedObjects[PLAYER_RIGHT] = this.getComputerPickedObject();

      var result = this.comparePlayerObjects();
      if(result !== null) {
        this.score.push(result);

        if(result > -1) {
          this.playerWins[result]++;
        }
      }

      this.result = this.determineGameResult();
    }
  };


  Model.prototype.setUserObject = function(objectString) {
    var found = this.getObjectByName(objectString);
    if(found) {
      this.selectedObjects[PLAYER_LEFT] = found;
    }
  };

  Model.prototype.resetUserObject = function() {
    this.selectedObjects[PLAYER_LEFT] = null;
  }


  /**
  * Pick a random object
  * @return {Number} Array index for objects array
  */
  Model.prototype.getComputerPickedObject = function() {
    var index = Math.floor(Math.random() * ((this.objects.length-1) - 0 + 1)) + 0;
    return this.objects[index];
  };


  /**
  * Determine winner between two objects, otherwise a draw
  * @return {Number | null} A number (constant) that represents winning player or draw
  */
  Model.prototype.comparePlayerObjects = function() {
    if(this.selectedObjects.length < 2) {
      return null;
    }
    if(this.selectedObjects[PLAYER_LEFT].name === this.selectedObjects[PLAYER_RIGHT].name) {
      return DRAW;
    }
    if(this.objectLoses(this.selectedObjects[PLAYER_LEFT], this.selectedObjects[PLAYER_RIGHT])) {
      return PLAYER_RIGHT;
    }
    return PLAYER_LEFT;
  };


  /**
  * Check given object loses against another object as defined, or not
  * @return {Boolean} Loses true or false
  */
  Model.prototype.objectLoses = function(object, versusObject) {
    for(var i = 0; i < object.losesTo.length; i++) {
      if(object.losesTo[i] === versusObject.name) {
        return true;
      }
    }
    return false;
  };


  Model.prototype.determineGameResult = function() {
    if(this.score.length > (this.bestOutOf / 2)) { // If majority of rounds played
      var maxGamesRemaining = (this.bestOutOf - this.score.length);

      if(this.playerWins[PLAYER_LEFT] > (this.playerWins[PLAYER_RIGHT] + maxGamesRemaining)) { // Player left win (right can't catch up)
        return PLAYER_LEFT;
      }
      if(this.playerWins[PLAYER_RIGHT] > (this.playerWins[PLAYER_LEFT] + maxGamesRemaining)) { // Player right win (left can't catch up)
        return PLAYER_RIGHT;
      }
      if(this.playerWins[PLAYER_LEFT] === this.playerWins[PLAYER_RIGHT] && maxGamesRemaining === 0) { // Draw
        return DRAW;
      }

    }
    return null;
  };


  /**
  * Report that game is either in progress (true), or not yet started (false)
  * @return {Boolean}
  */
  Model.prototype.inProgress = function() {
    return (this.score.length > 0) ? true : false;
  };


  Model.prototype.getObjectByName = function(name) {
    for(var i = 0; i < this.objects.length; i++) {
      if(this.objects[i].name === name) {
        return this.objects[i];
      }
    }
    return null;
  };


  return Model;

}());