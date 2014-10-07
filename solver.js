function uniq(arr) {  //http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
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
}

function flatten(arr) {
  return arr.reduce(function(a,b) {
    return a.concat(b);
  });
}

function flattenAndUniq(arr) {
  return uniq.call(this, flatten(arr));
}

function diffArrays (A, B) { //http://www.deepakg.com/prog/2009/01/ruby-like-difference-between-two-arrays-in-javascript/
    var strA = ":" + A.join("::") + ":",
        strB = ":" +  B.join(":|:") + ":",
        reg = new RegExp("(" + strB + ")","gi"),
        strDiff = strA.replace(reg,"").replace(/^:/,"").replace(/:$/,"");

    return strDiff.split("::");
}

Game = function(boardString) {
  this.makeBoard(boardString);
};

Game.prototype = {
  makeBoard: function(boardString) {
    if ( boardString.length !== 81 ) {
      throw "Invalid board string";
    }

    var i = 0;

    this.board = [];

    for (i; i<81; i++) {
      this.board.push(new Cell(boardString.charAt(i), i));
    }
  },
  isSolved: function() {
    var emptyCellsFound = false,
        i = 0;

    while ( !emptyCellsFound && i<81 ) {
      if ( this.board[i].digit === "0" ) {
        return emptyCellsFound;
      }
      i++;
    }

    return !emptyCellsFound;
  },
  printBoard: function() {
    var that = this,
        divider = "-------------------------------",
        i = 0,
        j = 0,
        printRow = function() {
          var count = 9*(i/9|0) + 9,
              rowToPrint = "|";
          for (i; i<count; i++) {
            rowToPrint += " " + that.board[i].digit + " ";
            if ( i % 3 === 2 ) {
              rowToPrint += "|";
            }
          }
          console.log( rowToPrint );
        };
    console.log( divider );
    for (j; j<3; j++) {
      printRow();
    }
    console.log( divider );
    for (j; j<6; j++) {
      printRow();
    }
    console.log( divider );
    for (j; j<9; j++) {
      printRow();
    }
    console.log( divider );
  },
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
  buildRelatedValues: function(currentIndex) {
    var i = 0,
        NUM_OF_RELATED_CELLS = 20,
        relatedValues = [];

    for(i; i<NUM_OF_RELATED_CELLS; i++) {
      if ( this.board[this.board[currentIndex].relatedCells[i]].digit !== "0" ) {
        relatedValues.push( this.board[this.board[currentIndex].relatedCells[i]].digit );
      }
    }

    return flattenAndUniq(relatedValues).sort();
  },
  buildPossibleValues: function(currentIndex) {
    var POSSIBLE_VALUES = ["1","2","3","4","5","6","7","8","9"],
        relatedValues = this.buildRelatedValues(currentIndex);

    return diffArrays(POSSIBLE_VALUES, relatedValues);
  },
  checkAllCells: function() {
    var i = 0,
    anyChanges = false;

    for (i; i<81; i++) {
      if( this.board[i].digit === "0" ) {
        if( this.findCellValue(i) ) {
          anyChanges = i;
        }
      }
    }

    return anyChanges;
  },
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
  solve: function() {
    while ( !this.isSolved() ){
      if ( !this.checkAllCells() ) {
        this.guessNextEmptyCell();
      }
    }
  }
};

Cell = function(digit, index) {
  this.digit = digit;
  this.index = index;
  this.getRelatedCellIndeces();
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
    this.relatedCells = flattenAndUniq(relatedCells);
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

easy = new Game("005030081902850060600004050007402830349760005008300490150087002090000600026049503");
console.log("For first cell, isEmpty should return true: " + easy.board[0].isEmpty());
console.log("Before solving, isSolved should return false: " + easy.isSolved());
console.log("For first cell, getSameRow should return [1,2,3,4,5,6,7,8]: " + (easy.board[0].getSameRow().toString() === "1,2,3,4,5,6,7,8"));
console.log("For the first cell, relatedCells should equal [1,2,3,4,5,6,7,8,9,10,11,18,19,20,27,36,45,54,63,72]: " + (easy.board[0].relatedCells.toString() === "1,2,3,4,5,6,7,8,9,10,11,18,19,20,27,36,45,54,63,72"));
console.log( "EASY:" );
easy.printBoard();
easy.solve();
easy.printBoard();
console.log( "HARD:" );
hard = new Game("850002400720000009004000000000107002305000900040000000000080070017000000000036040");
hard.printBoard();
hard.solve();
hard.printBoard();
