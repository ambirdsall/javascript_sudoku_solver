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

testGame = new Game("096040001100060004504810390007950043030080000405023018010630059059070830003590007");
