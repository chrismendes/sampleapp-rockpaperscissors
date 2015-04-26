(function($) {

  'use strict';

  // (Reference to "object(s)" refers to rock/paper/scissors game object)

  var selectors = {
    newGameButton:                  '.js-newgame',
    userObjectButtons:              '.js-objectchoice',
    userObjectButtonsBox:           '.js-objectchoices',
    userSubmitObjectButton:         '.js-usersubmit',
    nextRoundButton:                '.js-nextround',

    objectSpaces:                   '.js-objectspace',
    objects:                        '.js-object',
    playerLeftSpace:                '.js-playerleft',
    playerRightSpace:               '.js-playerright',
    playerLeftObject:               '.js-playerleft > .js-object',
    playerRightObject:              '.js-playerright > .js-object',

    feedbackMessages:               '.js-feedback',
    feedbackMessagePlayerLeft:      '.js-playerleft > .js-feedback',
    feedbackMessagePlayerRight:     '.js-playerright > .js-feedback',
    playerLabelLeft:                '.js-playerleft > .js-playerlabel',
    playerLabelRight:               '.js-playerright > .js-playerlabel',

    score:                          '.js-score > li',
    countdownText:                  '.js-countdown',

    gameModeSelect:                 '.js-gamemode'
  };

  var $el = cacheElements();

  var states = {
    global:   { selected: 'is-selected', disabled: 'is-disabled', hidden: 'is-hidden', highlighted: 'is-highlighted' },
    objects:  { rock: 'is-rock', paper: 'is-paper', scissors: 'is-scissors' },
    result:   { winner: 'is-winner' }
  };

  var game;
  var computerVsComputer = false;

  var PLAYER_LEFT = 0;
  var PLAYER_RIGHT = 1;
  var DRAW = -1;


  // ---
  // Event Delegation
  // ---
  $(document).delegate(selectors.newGameButton, 'click', onGameStartClick);
  $(document).delegate(selectors.userObjectButtons, 'click', onObjectSelect);
  $(document).delegate(selectors.userSubmitObjectButton, 'click', onObjectSubmit);
  $(document).delegate(selectors.nextRoundButton, 'click', onNextRoundClick);


  // ---
  // Event Handlers
  // ---
  function onGameStartClick() {
    computerVsComputer = ($el.gameModeSelect.val() === 'play') ? false : true;
    ui.updatePlayerLabels();

    game = new window.App.RockPaperScissorsModel();
    ui.resetScore();

    if(computerVsComputer === false) {
      onNextRoundClick();
    } else {
      ui.clearObjectSpaces();
      ui.hidePlayerControls();
      ui.updateNewGameButtonState();
      automateComputerMove();
    }
  }

  function onObjectSelect(e) {
    var button = $(e.currentTarget);
    if(button.hasClass(states.global.disabled) || button.hasClass(states.global.selected)) {
      return;
    }
    var objectName = button.attr('data-object');
    game.setUserObject(objectName);

    $el.userObjectButtons.removeClass(states.global.selected); // Unselect previously selected button
    button.addClass(states.global.selected); // Marked selected button as such
    $el.userSubmitObjectButton.removeClass(states.global.disabled); // Enable submit button

    ui.showSelectedObjectPreview(objectName);
  }

  function onObjectSubmit() {
    if(typeof game !== 'undefined') {
      game.playRound();

      ui.removeSelectedObjectPreview();
      ui.disablePlayerObjectButtons();

      startOutcomeCountdown();
    }
  }

  function startOutcomeCountdown() {
    var countdown = 3;
    var textRestore = $el.countdownText.html();
    $el.countdownText.addClass('is-promoted');
    $el.countdownText.html(countdown);

    var timer = setInterval(function() { // Every 1 second
      countdown--;
      $el.countdownText.html(countdown);
      if(countdown <= 0) { // When 0 reached, show result
        showRoundOutcome();

        $el.countdownText.removeClass('is-promoted');
        $el.countdownText.html(textRestore);
        clearInterval(timer)
      }
    }, 1000);
  }

  function showRoundOutcome() {
    ui.updateScore(game.score);
    ui.showPlayerObjects(game.selectedObjects[0].name, game.selectedObjects[1].name);
    ui.updateNewGameButtonState();

    if(game.result !== null) { // Game over
      ui.showEndResult();
      ui.disableNextRoundButton();
    } else { // Game not over
      if(computerVsComputer === false) {
        ui.showNextRoundButton();
      } else {
        setTimeout(automateComputerMove, 1000);
      }
    }
  }

  function onNextRoundClick() {
    if(game.result === null) {
      ui.clearObjectSpaces();
      ui.resetPlayerControls();
      ui.updateNewGameButtonState();
      ui.showObjectSubmitButton();
    }
  }

  function automateComputerMove() {
    if(typeof game !== 'undefined') {
      setTimeout(function() {
        ui.clearObjectSpaces();
        game.resetUserObject();
        game.playRound();
        startOutcomeCountdown();
      }, 2000);
    }
  }


  // ---
  // UI Manipulation
  // ---
  var ui = {

    resetPlayerControls: function() {
      $el.userObjectButtons.removeClass(states.global.hidden + ' ' + states.global.selected + ' ' + states.global.disabled); // Unhide/unselect/enable object choice buttons
      $el.userSubmitObjectButton.removeClass(states.global.hidden); // Unhide choice submit button
      $el.userSubmitObjectButton.addClass(states.global.disabled); // Disable choice submit button

      $el.feedbackMessagePlayerLeft.html('Pick Object'); // Direct user to select an object
      $el.userObjectButtonsBox.addClass(states.global.highlighted);
    },

    hidePlayerControls: function() {
      $el.userObjectButtons.addClass(states.global.hidden);
      $el.userSubmitObjectButton.addClass(states.global.hidden);
      $el.nextRoundButton.addClass(states.global.hidden);
    },

    updateNewGameButtonState: function() {
      if(game.inProgress()) {
        $el.newGameButton.removeClass(states.global.disabled); // Enable 'New Game' button
      } else {
        $el.newGameButton.addClass(states.global.disabled); // Disable 'New Game' button
      }
    },

    clearObjectSpaces: function() {
      $el.feedbackMessages.html(''); // Clear game feedback messages
      $el.feedbackMessagePlayerLeft.removeClass(states.result.winner);  // Withdraw winner highlighting
      $el.feedbackMessagePlayerRight.removeClass(states.result.winner); // Withdraw winner highlighting
      ui.hideObjects();
    },

    hideObjects: function() {
      $el.objects.removeClass(states.objects.rock + ' ' + states.objects.paper + ' ' + states.objects.scissors); // Remove object from player spaces
    },

    showSelectedObjectPreview: function(object) {
      ui.hideObjects(); // Clear current object
      $el.feedbackMessagePlayerLeft.html(''); // Clear feedback message
      $el.playerLeftObject.addClass('is-ghost');
      $el.playerLeftObject.addClass(states.objects[object]); // Display user chosen object
    },

    removeSelectedObjectPreview: function() {
      ui.hideObjects(); // Clear current object
      $el.playerLeftObject.removeClass('is-ghost');
    },

    disablePlayerObjectButtons: function() {
      $el.userObjectButtons.addClass(states.global.disabled); // Disabled buttons
      $el.userObjectButtonsBox.removeClass(states.global.highlighted); // Unhighlight buttons
      $el.userSubmitObjectButton.addClass(states.global.disabled); // Disable submit button
    },

    updateScore: function(score) {
      for(var i = 0; i < score.length; i++) {
        var letter, style = 'is-void';

        switch(score[i]) {
          case PLAYER_LEFT: {
            letter = 'A';
            if(computerVsComputer === false) {
              letter = 'W';
              style = 'is-player';
            }
            break;
          }
          case PLAYER_RIGHT: {
            letter = 'B';
            if(computerVsComputer === false) {
              letter = 'L';
              style = 'is-computer';
            }
            break;
          }
          case DRAW: letter = 'D'; break;
        }

        $el.score.eq(i).html(letter);
        $el.score.eq(i).attr('class', '').addClass(style);
      }
    },

    resetScore: function() {
      $el.score.each(function() {
        $(this).html('');
      });
    },

    showPlayerObjects: function(objectLeft, objectRight) {
      $el.playerLeftObject.addClass(states.objects[objectLeft]);
      $el.playerRightObject.addClass(states.objects[objectRight]);
    },

    showObjectSubmitButton: function() {
      $el.nextRoundButton.addClass(states.global.hidden);
      $el.userSubmitObjectButton.removeClass(states.global.hidden);
    },
    showNextRoundButton: function() {
      $el.userSubmitObjectButton.addClass(states.global.hidden);
      $el.nextRoundButton.removeClass(states.global.disabled).removeClass(states.global.hidden);
    },
    disableNextRoundButton: function() {
      $el.nextRoundButton.addClass(states.global.disabled);
    },
    showEndResult: function() {
      switch(game.result) {
        case null: return;
        case PLAYER_LEFT:   $el.feedbackMessagePlayerLeft.html('Winner');  $el.feedbackMessagePlayerLeft.addClass(states.result.winner); break;
        case PLAYER_RIGHT:  $el.feedbackMessagePlayerRight.html('Winner'); $el.feedbackMessagePlayerRight.addClass(states.result.winner); break;
        case DRAW: {
          $el.feedbackMessagePlayerLeft.html('Draw');
          $el.feedbackMessagePlayerRight.html('Draw');
          break;
        }
      }
    },

    showComputerVsComputerButton: function() {
      $el.playerVsComputerButton.addClass(states.global.hidden);
      $el.computerVsComputerButton.removeClass(states.global.hidden);
    },

    showPlayerVsComputerButton: function() {
      $el.computerVsComputerButton.addClass(states.global.hidden);
      $el.playerVsComputerButton.removeClass(states.global.hidden);
    },

    updatePlayerLabels: function() {
      if(computerVsComputer === false) {
        $el.playerLabelLeft.html('You');
        $el.playerLabelRight.html('Computer');
      } else {
        $el.playerLabelLeft.html('Computer A');
        $el.playerLabelRight.html('Computer B');
      }
    }

  };


  // ---
  // Helpers
  // ---
  function cacheElements() {
    var cached = {};
    for(var key in selectors) {
      cached[key] = $(selectors[key]);
    }
    return cached;
  }


}(jQuery));