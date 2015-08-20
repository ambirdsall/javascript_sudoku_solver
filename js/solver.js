// Constructor. Takes a string of digits 0-9, representing a sudoku game in any
// stage of completion. 0s represent empty cells. Indeces 0-8 form the first row
// of the board; 9-17 the second row; and so on.
function Game(boardString) {
  var i = 0;
  this.board = [];

  if ( boardString.length !== 81 ) {
    throw "Invalid board string";
  }

  for (i; i<81; i++) {
    this.board.push(new Cell(boardString.charAt(i), i));
  }
};

// Constructor. Each cell is instantiated with a digit 0-9 and an index 0-80.
// Based on that index, which represents its position on a sudoku board, a list
// of other indeces is made, comprising the locations of every cell in the same
// row || column || box. I.e., all the cells whose values are mutually exclusive.
// Having this list for every cell is necessary and sufficient to solve for a
// cell's value.
function Cell(digit, index) {
  this.digit = digit;
  this.index = index;
  this.getRelatedCellIndeces();
};

Game.prototype = {
  // Until the board is solved:
  //   * sweeps all 81 cells, trying to see if any can be calculated
  //     deterministically
  //   * if any can, repeat until either the board is solved or no more cell
  //     values can be found without guessing
  //   * once all certain values have been exhausted, guess the first potential
  //     value of the first empty cell and solve on, marking the guess and all
  //     values that follow with {isGuess: true}. The guess is cached, so if it
  //     proves incorrect, after all cells where (isGuess) have been wiped, the
  //     program can continue with the next potiential value.
  solve: function() {
    while ( !this.isSolved() ){
      if ( !this.checkAllCells() ) {
        this.guessNextEmptyCell();
      }
    }
  },

  // Checks each cell in order. If any is empty, tries to findCellValue; if
  // successful, sets anyChanges to true.
  // returns true if any cells were successfully changed; otherwise false.
  checkAllCells: function() {
    var i = 0,
    anyChanges = false;

    for (i; i<81; i++) {
      if( this.board[i].digit === "0" ) {
        if( this.findCellValue(i) ) {
          anyChanges = true;
        }
      }
    }

    return anyChanges;
  },

  // For the given cell, it determines all the values that are "available" to it:
  // a list of the non-zero digits in the same column, row, or box is compiled;
  // that set is subtracted from the set of digits 0-9. The remaining set is the
  // only possible values. If there's only one, that's the answer.
  //
  // The program doesn't start guessing cells until every cell that can be
  // determined for sure has been found; and once a guess has been made, any
  // further cell values you deduce are contingent on a guess being correct.
  // Because of that, every cell value that gets calculated OR guessed after the
  // first guess has been made is marked a guess, the easier to wipe clean if it
  // turns out there are wrong values filled in.
  findCellValue: function(currentIndex) {
    var possibleValues = this.buildPossibleValues(currentIndex);

    if ( possibleValues.length === 1 ) {
      if ( possibleValues[0] === "" ) {
        this.clearGuesses();
        return;
      }
      this.board[currentIndex].digit = possibleValues[0];
      if ( this.hasOwnProperty("hasGuesses") ) {
        this.board[currentIndex].isGuess = true;
      }
      return this.board[currentIndex].digit;
    }
  },

  // Checks each cell, starting at the index of the last-guessed cell or 0 if
  // there have been no guesses yet, until the first empty cell is found. That
  // cell's possible values are compiled, and the next guess is made
  // (cf. Cell.prototype.guessNext)
  guessNextEmptyCell: function() {
    var i = (this.hasOwnProperty("lastGuessedCell") ? this.lastGuessedCell : 0),
    possibleValues;

    for (i; i<81; i++) {
      if ( this.board[i].digit === "0" ) {
        possibleValues = this.buildPossibleValues(i);
        if ( possibleValues[0] === '' ) {
          this.clearGuesses();
        } else {
          this.board[i].guessNext(possibleValues);
          this.hasGuesses = true;
          this.lastGuessedCell = i;
          return;
        }
      } else if ( i === 80 ) {
        i = -1;
      }
    }
  },

  // Checks each cell in order. If any is empty (digit === "0"), isSolved
  // immediately returns false; otherwise it continues to check. If no empty
  // cell is found, returns true.
  isSolved: function() {
    var emptyCellsFound = false,
    i = 0;

    while ( !emptyCellsFound && i<81 ) {
      if ( this.board[i].digit === "0" ) {
        return emptyCellsFound;
      }
      i++;
    }

    return true;
  },

  buildRelatedValues: function(currentIndex) {
    var i = 0,
        NUM_OF_RELATED_CELLS = 20,
        // relatedValues containing "0" is something of a hack:
        // as far as util.diffArrays is concerned,
        //   ["1".."9"] - ["0","1"] === ["1".."9"] - ["1"]
        // but
        //   ["1".."9"] - [] === ["123456789"]
        relatedValues = ["0"];

    for(i; i<NUM_OF_RELATED_CELLS; i++) {
      if ( this.board[this.board[currentIndex].relatedCells[i]].digit !== "0" ) {
        relatedValues.push( this.board[this.board[currentIndex].relatedCells[i]].digit );
      }
    }

    return util.flattenAndUniq(relatedValues).sort();
  },

  buildPossibleValues: function(currentIndex) {
    var POSSIBLE_VALUES = ["1","2","3","4","5","6","7","8","9"],
        relatedValues = this.buildRelatedValues(currentIndex);
    return util.diffArrays(POSSIBLE_VALUES, relatedValues);
  },

  clearGuesses: function() {
    var i = 0;

    for (i; i<81; i++) {
      if ( this.board[i].hasOwnProperty("isGuess") ) {
        this.board[i].digit = "0";
        delete this.board[i].isGuess;
      }
    }

    delete this.hasGuesses;
  },
};

Cell.prototype = {
  isEmpty: function() {
    return this.digit === "0" ? true : false;
  },

  guessNext: function(possibleValues) {
    var indexOfLastGuess,
        indexOfNewGuess;
    if ( this.hasOwnProperty("lastGuess") ) {
      indexOfLastGuess = possibleValues.indexOf(this.lastGuess);
      indexOfNewGuess = (indexOfLastGuess === possibleValues.length - 1 ? 0 : indexOfLastGuess + 1);
      this.digit = possibleValues[indexOfNewGuess];
    } else {
      this.digit = possibleValues[0];
    }
    this.isGuess = true;
    this.lastGuess = this.digit;
  },

  getRelatedCellIndeces: function() {
    var relatedCells = [];

    relatedCells.push(this.getSameRow());
    relatedCells.push(this.getSameCol());
    relatedCells.push(this.getSameBox());
    this.relatedCells = util.flattenAndUniq(relatedCells);
  },

  getSameRow: function() {
    var i=0,
    row=[];

    for (i; i<81; i++) {
      if ( i !== this.index && ((i/9|0) === (this.index/9|0)) ) {
        row.push(i);
      }
    }

    return row;
  },

  getSameCol: function() {
    var i=0,
    col=[];

    for (i; i<81; i++) {
      if ( i !== this.index && ((i%9|0) === (this.index%9|0)) ) {
        col.push(i);
      }
    }
    return col;
  },

  getSameBox: function() {
    var i=0,
    box=[];

    for (i; i<81; i++) {
      if ( i !== this.index &&
          (((i/9|0)/3|0) === ((this.index/9|0)/3|0)) &&
          (((i%9|0)/3|0) === ((this.index%9|0)/3|0)) ) {
        box.push(i);
      }
    }

    return box;
  }
};

var util = {
  //http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
  uniq: function(arr) {
    var i = 0,
    len = arr.length,
    out = [],
    obj = {};

    for ( i; i<len; i++ ) {
      obj[arr[i]] = 0;
    }
    for ( i in obj ) {
      out.push(i);
    }

    return out;
  },

  flatten: function(arr) {
    return arr.reduce(function(a,b) {
      return a.concat(b);
    });
  },

  flattenAndUniq: function(arr) {
    return this.uniq.call(this, this.flatten(arr));
  },

  //http://www.deepakg.com/prog/2009/01/ruby-like-difference-between-two-arrays-in-javascript/
  diffArrays: function (A, B) {
    var strA = ":" + A.join("::") + ":",
    strB = ":" +  B.join(":|:") + ":",
    reg = new RegExp("(" + strB + ")","gi"),
    strDiff = strA.replace(reg,"").replace(/^:/,"").replace(/:$/,"");

    // if B is an empty array, everything falls to shit.
    // e.g. ["1","2"] - [] === ["12"]
    if (B.length === 0) {
      return A;
    } else {
      return strDiff.split("::");
    }
  }
}
//==========================SOLVE THAT SHIT=====================================
// Takes a string of 81 characters, where each is a numerical digit.
// Finds the appropriate cells in the DOM and sets each value to the
// corresponding digit.
//
// If passed an optional second argument that's truthy, each non-empty cell will
// have the class "red" added with its new digit.
function setBoard(gameBoard) {
  // 81 is a bit of a magic number, but it's also a really standard, reliable
  // value: sudoku is played on a 9x9 board and, well, you do the math.
  for (var i=0; i < 81; ++i) {
    // find table cell by index/id
    var cellID = "#cell-" + ("00" + i).slice(-2);

    // unless a second argument was given, wipe any and all "red" classiness
    // amongst the cells
    if (!arguments[1]) {
      $(cellID).removeClass("red");

    // if $(cellID).val() isn't truthy, it's an empty string, i.e., no value has
    // been set, either by the user or preloaded. If you get into this branch,
    // the "make new digits red" argument has been given and it's a new digit.
    } else if (!$(cellID).val()) {
      $(cellID).addClass("red");
    }
    // set table cell entry to game cell value
    $(cellID).val(gameBoard[i].digit !== "0" ? gameBoard[i].digit : "");
  }
}

var emptyGame      = new Game("000000000000000000000000000000000000000000000000000000000000000000000000000000000"),
    currentGame    = emptyGame,
    puzzleSelector = $("#puzzle-selector"),
    loadButton     = $("#load-button"),
    clearButton    = $("#clear-button"),
    solveButton    = $("#solve-button");

loadButton.click(function(e) {
  e.preventDefault();
  var newBoard = puzzleSelector.val();
  currentGame = new Game(newBoard);
  setBoard(currentGame.board);
});

solveButton.click(function(e) {
  e.preventDefault();
  currentGame.solve();
  setBoard(currentGame.board, true);
});

clearButton.click(function(e) {
  e.preventDefault();
  setBoard(emptyGame.board);
});
