var app = app || {};
app.turn = 1;
app.round = 1;
app.player1Score = 0;
app.player2Score = 0;
app.isRoundInProgress = true;
app.gameOptionsAlreadyclicked = false;
app.startingPlayer = null;
app.currentPlayer = null;
app.hasBlocked = null;
app.cheat_amount_double_play = .25;
app.cheat_amount_steal_cell = .15;

//App is designed to allow 'class' type variables to minimise the need for unnecessary parameter passing.

$(document).ready(function() {
  gameBoard = setUpBoard();
  $('.difficulty_button').click(function(e) {
    if (app.gameOptionsAlreadyclicked === false) { //prevents a rare bug if gameoptions is dblclicked
      difficulty = e.target.id;
      console.log("Loading " + difficulty + " computer");
      whoStarts();
      countdownAnimation();
      app.gameOptionsAlreadyclicked = true;
    }
  });

  $(".game_table").click(function(e) {
    var IDOfCellClicked = e.target.id;
    playerMove(IDOfCellClicked);
  });

  $('#next_round').click(function() {
    clearBoard();
  });

  $('#scores').click(function() {
    toggleScores();
  });

  $('#switch_player').click(function() {
      app.round--;
      clearBoard();
  });

  $('#home').click(function() {
      location.reload();
  });
  console.log('%cWelcome to Ash\'s TicTacToe. Cheating enabled. Double play ' + app.cheat_amount_double_play + ". Steal Cell " + app.cheat_amount_steal_cell, 'color: red');
});


function countdownAnimation() {
  $('.game_in_play').fadeIn();
  $('.game_control').fadeOut(500);
  var countDownFrom = 4;
  setTimeout(function(){
    $('#countdown').delay(500).text("5...").fadeIn(500).fadeOut(500);
    var countDown = setInterval(function() {
        $('#countdown').text(countDownFrom + "...").fadeIn(500).fadeOut(500);
        countDownFrom--;
        if (countDownFrom <= 0) {
            clearTimeout(countDown);
        }
    }, 1000);
    $('#rolling').fadeIn(500).delay(4000).fadeOut(500);
    $('#starting_player_is').delay(5000).fadeIn(500).text("The starting player is " + app.startingPlayer);
    $('#begun, #play_happening, .game_table, #home, #score, #next_round').delay(5000).fadeIn(500);
    setupScoreBoard();
    $('#next_round').attr("disabled", "disabled");
 }, 500);
}

function setupScoreBoard() {
  if (difficulty === "human") {
      $('#title_score1').text("Player 1 Score");
      $('#title_score2').text("Player 2 Score");
  }
  else {
      $('#title_score1').text("Computer Score");
      $('#title_score2').text("Player Score");
  }
}

function setUpBoard() {
    var gameBoard = new Array(9);
    for (var i = 0; i < gameBoard.length; i++) {
        gameBoard[i] = null;
    }
    return gameBoard;
}

function toggleScores(){
  $('#scoreBox').fadeIn(500);
}

function whoStarts() {
  var randomPlayer = Math.floor(Math.random() * 2 + 1);
  if (difficulty !== "human") {
      if (randomPlayer === 1) {
          app.startingPlayer = "The Computer of Doom!";
          app.currentPlayer = 'X';
          setTimeout(function() {
              app.isRoundInProgress = true;
              AIPlay();
          }, 5000);
      } else {
          app.startingPlayer = "The Human";
          app.currentPlayer = 'O';
      }
  } else {
      if (randomPlayer === 1) {
          app.startingPlayer = "Player 1";
          app.currentPlayer = 'X';
      } else {
          app.startingPlayer = "Player 2";
          app.currentPlayer = 'O';
      }
  }
}

function changePlayer() {
  if (app.currentPlayer === 'X') {
      app.currentPlayer = 'O';
  } else {
      app.currentPlayer = 'X';
  }
  $('#starting_player_is').text(app.currentPlayer + " It's your turn");
}

function changeStartingPlayer() {
  if (app.startingPlayer == ("The Computer of Doom!")) {
      app.startingPlayer = "The Human";
      app.currentPlayer = 'O';
  } else if (app.startingPlayer === "The Human") {
      app.startingPlayer = "The Computer of Doom!";
      app.currentPlayer = 'X';
  } else if (app.startingPlayer === "Player 1") {
      app.startingPlayer = "Player 2";
      app.currentPlayer = 'O';
  } else if (app.startingPlayer === "Player 2") {
      app.startingPlayer = "Player 1";
      app.currentPlayer = 'X';
  }
}

function playerMove(IDOfCellClicked) {
  if (app.isRoundInProgress === true) {
    if (gameBoard[IDOfCellClicked] === null) { // checks if position on board has already been played
        gameBoard[IDOfCellClicked] = app.currentPlayer; // UPDATING THE ARRAY
        $('#' + IDOfCellClicked).prepend(app.currentPlayer);
         console.log("Turn " + app.turn + ". The player played in cell " + IDOfCellClicked)
        if (checkForWin()) {
            if (difficulty === "AICheater") {
              completelyCheatIfHumanCanWin()
            } else {
              launchWin();
            }
        } else if (checkForDraw()) {
            roundDrew();
        } else {
          changePlayer();
          app.isRoundInProgress = false; //PLAYER CANNOT PLAY WHILE AI IS "THINKING"
          setTimeout(function() {
              app.isRoundInProgress = true;
              AIPlay();
          }, 500);
        }
      app.turn++;
    }
  }
}

function clearBoard() {
  app.round++;
  app.turn = 1
  app.isRoundInProgress = true;
  changeStartingPlayer();
  for (var i = 0; i < 9; i++) { // Clearing the array
    gameBoard[i] = null;
  }
  $('.game_table td').empty().css("background-color", "transparent");
  $('#starting_player_is').text(app.startingPlayer + " will start this round.");
  $('#begun').text("The game continues! Round " + app.round);
  console.log("%cNew round! " + app.currentPlayer + " will start this round.", 'color: red');
  if (app.currentPlayer === "X") {
      AIPlay();
  }
  $('#next_round').attr("disabled", "disabled");
}

function checkForWin() {
  // check col win
  for (var i = 0; i < 3; i++) {
      if (gameBoard[i] === app.currentPlayer && gameBoard[i + 3] === app.currentPlayer && gameBoard[i + 6] === app.currentPlayer) {
          winningCells = [i, i + 3, i + 6]; //For CSS coloring
          return true;
      }
  }
  // check row win
  for (var j = 0; j < 9; j += 3) {
      if (gameBoard[j] === app.currentPlayer && gameBoard[j + 1] === app.currentPlayer && gameBoard[j + 2] === app.currentPlayer) {
          winningCells = [j, j + 1, j + 2];
          return true;
      }
  }
  // check diagonal win
  for (var k = 0; k <= 2; k += 2) {
      if (gameBoard[k] === app.currentPlayer && gameBoard[4] === app.currentPlayer && gameBoard[8 - k] === app.currentPlayer) {
          winningCells = [k, 4, 8 - k];
          return true;
      }
  }
  return false;
}

function checkForDraw() {
  //if all elements are not null then unless a win, it must be a draw
  for (var i = 0; i < 9; i++) {
    if (gameBoard[i] === null) {
        return false;
    }
  }
  increaseCheating()
  return true;
}

function roundDrew() {
  $('#starting_player_is').text("It's a draw!").fadeIn(100);
  endRound();
}

function launchWin() {
  $('#starting_player_is').text(app.currentPlayer + " Takes The Round!").fadeIn(100);
  updateScore();
  endRound();
  for (var i = 0; i < 3; i++) { //Look into using .each or similar rather than a for loop
    $("#" + winningCells[i]).css("background-color", "red");
  }
}

function endRound() {
  app.isRoundInProgress = false;
  $('#next_round').attr("disabled", false);
  console.log("Winning cells where " + winningCells + ". The score is Player - " + app.player2Score + " to Computer - " + app.player1Score);
}

function updateScore() {
  if (app.currentPlayer === 'X') {
    app.player1Score++;
    $('#player1ScoreBoard').text(app.player1Score);
  } else if (app.currentPlayer === 'O') {
    app.player2Score++;
    $('#player2ScoreBoard').text(app.player2Score);
  }
}

function AIPlay() {
  if (difficulty === "easy" && app.isRoundInProgress === true) {
      AIEasy();
  } else if (difficulty === "intermediate" && app.isRoundInProgress === true) {
      AIIntermediate();
  } else if (difficulty === "AIHardDefending" && app.isRoundInProgress === true) {
      AIHardDefending();
  } else if (difficulty === "AICheater" && app.isRoundInProgress === true) {
      AICheater();
  }
  app.turn++;
}

function isComputerAbleToWin() {
  //The computer plays in any open cell. It then checks if that cell will cause it to win.
  //If the cell will cause a win return the id of that cell otherwise clear the cell.
  for (var x = 0; x < 9; x++) {
    if (gameBoard[x] === null) {
      gameBoard[x] = app.currentPlayer; //careful
      if (checkForWin()) {
        app.getRidOfthis = x
        gameBoard[x] = null;
        return true
      } else {
        gameBoard[x] = null;
      }
    }
  }
  return false;
}

function playToWin() {
  $('#' + app.getRidOfthis).prepend(app.currentPlayer);
  console.log("Turn " + app.turn + ". The computer played to win. Took cell " + app.getRidOfthis);
  launchWin();
}

function doesComputerNeedToBlock(mode) {
  //The computer plays as the human in any open cell. It then checks if that cell will cause a human win.
  //If the cell will cause a human win return the id of that cell. Then clear the cell.
  changePlayer();
  for (var p = 0; p < 9; p++) {
    if (gameBoard[p] === null) {
      gameBoard[p] = app.currentPlayer;
      if (checkForWin()) {
        gameBoard[p] = null;
        humanAbleToWinAt = p;
        if (mode === 'first') {
          app.cheatBlockAt = p;
        }
        app.currentPlayer = 'X'
        return true;
      }
      else {
        gameBoard[p] = null;
      }
    }
  }
  changePlayer();
}

function playRandomly() {
  var findingFreeCell = true;
  while (findingFreeCell) { //while works better than a for loop because the ending is uncertain.
    var randomMove = Math.floor(Math.random() * 9);
    if (gameBoard[randomMove] === null) {
      gameBoard[randomMove] = app.currentPlayer; // Updating the array
      $('#' + randomMove).prepend(app.currentPlayer);
      findingFreeCell = false;
      if (checkForWin()) {
        launchWin();
      } else if (checkForDraw()) {
        roundDrew();
      }
      changePlayer();
      console.log("Turn " + app.turn + ". The computer played randomly. Took cell " + randomMove);
    }
  }
}

function AIHardDefending() {
  //This is loaded when the computer plays 2nd. The computer is aiming to draw.
  if (isComputerAbleToWin()) {
    //computer plays in winning cell
    playToWin();
  } else if (doesComputerNeedToBlock()) {
    playToBlock()
  } else if (gameBoard[4] === null) {
    gameBoard[4] = app.currentPlayer;
    $('#' + 4).prepend(app.currentPlayer);
    changePlayer();
    console.log("Computer took the center to be defensive");
  } else if (gameBoard[2] === 'O' && gameBoard[6] === 'O' && app.turn === 3) { //prevents an incorrect corner play
    gameBoard[3] = app.currentPlayer; //could use a randomizer here, could add to next else if
    $('#' + 3).prepend(app.currentPlayer);
    changePlayer();
    console.log("Computer took 3 to prevent alt corn 2 way win");
  } else if (gameBoard[0] === 'O' && gameBoard[8] === 'O' && app.turn === 3) {
    gameBoard[5] = app.currentPlayer;
    $('#' + 5).prepend(app.currentPlayer);
    changePlayer();
    console.log("Computer took 5 to prevent alt corn 2 way win");
  }
  //can still lose if human takes center
  else if (gameBoard[4] === 'O' && app.turn == 1) {
    gameBoard[6] = app.currentPlayer;
    $('#' + 6).prepend(app.currentPlayer);
    changePlayer();
    console.log("Computer took 6 to prevent middle triangle win");
  } else if (gameBoard[4] === 'O' && app.turn == 3) {
    gameBoard[8] = app.currentPlayer;
    $('#' + 8).prepend(app.currentPlayer);
    changePlayer();
    console.log("Computer took 8 to prevent middle triangle win");
  } else {
    playRandomly();
  }
}

function playToBlock() {
  //computer plays in blocking cell
  gameBoard[humanAbleToWinAt] = app.currentPlayer;
  $('#' + humanAbleToWinAt).prepend(app.currentPlayer);
  changePlayer();
  console.log("Turn " + app.turn + ". Computer played in cell " + humanAbleToWinAt + " to block human win.");
  if (checkForDraw()) {
    roundDrew();
  }
}

function weightedPlay(chance){
  value =  Math.random().toFixed(2);
  if (value < chance) {
      console.log("Turn " + app.turn + ". Rolling for weighted played - Success. " + value + " " + chance)
    return true
  }
  else {
    console.log("Turn " + app.turn + ". Rolling for weighted played - Unsuccessful. " + value + " " + chance)
    return false
  }
}

function AICheater() {
  app.currentPlayer = 'X'
  app.blockThisTurn = 0
  if (isComputerAbleToWin()) {
    playToWin();
    return;
  }
  else if (app.turn > 7 && canStealCellAndWin() && feelLikeCheating(app.cheat_amount_steal_cell)) {
    console.log("Turn " + app.turn + ". The computer stole cell " + app.stealWhichCellToWin +  " to win.");
    app.turn++
    stealCell()
    return
  }
  else if (doesComputerNeedToBlock('first')) {
    playToBlock();
    app.blockThisTurn = 1
  }
  else if ((gameBoard[4] === null) && weightedPlay(.95/((app.round/3.5))))  {
    // The longer the game goes on the less the computer preferences the center. This leads to more 2 way win cheating
    gameBoard[4] = app.currentPlayer;
    $('#' + 4).prepend(app.currentPlayer);
    changePlayer();
    console.log("Turn " + app.turn + ". The computer played weighted defensively. Decided it needed the center");
  }
  else {
    playRandomly();
  }
  cheatingMoves(); // Chance to play twice
  cheatOnDraw(); //Did the computer win or draw by cheating?
}

function increaseCheating() {
  if (app.cheat_amount_double_play < .85) {
    app.cheat_amount_double_play = app.cheat_amount_double_play + .10
    app.cheat_amount_steal_cell = app.cheat_amount_steal_cell + .08
    console.log("Cheating amount increased to " + app.cheat_amount_double_play + " " + app.cheat_amount_steal_cell);
   }
  else if (app.cheat_amount_double_play >= .85) {
        console.log("Cheating amount at max");
  }
}

function decreaseCheating() {
   if (app.cheat_amount_double_play > .30) {
     app.cheat_amount_double_play = app.cheat_amount_double_play - .3
   }
   if (app.cheat_amount_steal_cell > .15) {
    app.cheat_amount_steal_cell = app.cheat_amount_steal_cell - .15
   }
   console.log("Cheating amount decreased to " + app.cheat_amount_double_play + " " + app.cheat_amount_steal_cell);
}

function cheatingMoves() {
  app.currentPlayer = 'X'
  if (((app.turn > 5) && app.turn < 8) && app.isRoundInProgress === true) {
    // cheating before turn 5 or after turn 8 is too obvious
    if (isComputerAbleToWin() && ((app.turn > 6) && app.turn < 9) && feelLikeCheating(app.cheat_amount_double_play)) {
      app.turn++
      playToWin();
      console.log("Turn " + app.turn + ". The computer snuck victory with a dirty double play.");
      return;
    }
    else if (doesComputerNeedToBlock()) {
      console.log('%c2 way win detected. Cheating odds have been drastically increased.', 'color: red')
      if (canStealCellAndWin() && feelLikeCheating(.30)) {
        stealCell();
        console.log("Turn " + app.turn + ". With impending doom the computer had no choice but to steal cell " + app.stealWhichCellToWin +  " to win.");
        return;
      }
      else if (isComputerAbleToWin() && feelLikeCheating(1)){
        app.turn++
        playToWin();
        console.log("Turn " + app.turn + ". A sneaky double play was used for an instant win.");
        return;
      }
      else if (canStealCellAndWin() && feelLikeCheating(.80)) {
        // This is here in case the first roll was a fail and the computer couldn't win via playing twice
        stealCell();
        console.log("Turn " + app.turn + ". With impending doom the computer had no choice but to steal cell " + app.stealWhichCellToWin +  " to win.");
        return;
      }
      else if (doesComputerNeedToBlock() && feelLikeCheating(.20)) {
        app.turn++;
        app.currentPlayer = 'X'
        playToBlock(); //If unable to instantly win then block the two win scenarios.
        app.currentPlayer = 'X'
        console.log("Turn - " + app.turn + " The computer couldn't win but felt the need to play twice to ruin your chances :).");
      }
    }
  }
}

function canStealCellAndWin() {
  for (var x = 0; x < 9; x++) {
    if (gameBoard[x] === 'O') {
      gameBoard[x] = 'X'
      if (checkForWin()) {
        app.stealWhichCellToWin = x
        gameBoard[x] = 'O';
        return true
      } else {
        gameBoard[x] = 'O';
      }
    }
  }
  return false;
}

function stealCell(playType) {
  gameBoard[app.stealWhichCellToWin] = 'X';
  if (app.blockThisTurn === 1) { //If first pay not used in win then hide it
    gameBoard[app.cheatBlockAt] = null;
    $('#' + app.cheatBlockAt).text('');
  }
  for (var i = 0; i < 3; i++) {
    $("#" + winningCells[i]).css("background-color", "red");
    $("#" + winningCells[i]).text("X");
  }
  launchWin();
}

function feelLikeCheating(chance) {
  value =  Math.random().toFixed(2);
  if (value < chance) {
    console.log("Turn " + app.turn + ". Successful cheat roll. Rolled " + value + ". Required was less than " + chance + ".")
    decreaseCheating()
    return true
  }
  else {
    console.log("Turn " + app.turn + ". Unsuccessful cheat roll. Rolled " + value + ". Required was less than " + chance + ".")
    increaseCheating()
    return false
  }
}

function cheatOnDraw() {
  if (checkForDraw() && app.round > 7 && feelLikeCheating(.30)) {
    for (var i = 0; i < 9; i++) {
      gameBoard[i] = 'X';
      $('#' + i).text('X');
    }
    launchWin();
    alert("I see a BOOORRRING DRAW coming. MEH I'll just take the win! Sucker!");
    console.log("Turn " + app.turn + ". The computer decided draws are boring and instead decided it would just win instead.")
  }
  app.currentPlayer = 'O'
}

function completelyCheatIfHumanCanWin() {
  for (var i = 0; i < 9; i++) {
    gameBoard[i] = 'X'; // Take all the cells
    $('#' + i).text('X').css('background-color','red');
  }
  changePlayer();
  alert("MUHAHAHAHA... YOU THINK YOU WIN????? WRONG I DO! FIND ANOTHER GAME TO WIN! Sucker...");
  console.log("Turn " + app.turn + ". The player was going to win so the computer took all the cells and won.")
  launchWin();
}
