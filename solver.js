function uniq(arr) {  // function name changed, but all logic curtesy of http://dreaminginjavascript.wordpress.com/2008/08/22/eliminating-duplicates/
  var i,
    len=arr.length,
    out=[],
    obj={};

  for (i=0;i<len;i++) {
    obj[arr[i]]=0;
  }
  for (i in obj) {
    out.push(i);
  }
  return out;
}

function flatten(arr) {
  return arr.reduce(function(a,b) {
    return a.concat(b);
  });
}

Game = function(boardString) {
  this.boardSize = 81;
  this.makeBoard(boardString);
}

Game.prototype = {
  makeBoard: function(boardString) {
    if (boardString.length !== this.boardSize) {
      throw "Invalid board string";
    }

    this.board = [];

    for (var i=0; i<this.boardSize; i++) {
      this.board.push(new Cell(boardString.charAt(i), i))
    }
  },
  isSolved: function() {
    var emptyCellsFound = false,
        i = 0;
    while (!emptyCellsFound && i<this.boardSize) {
      if (this.board[i].digit === "0") {
        return emptyCellsFound;
      }
      i++;
    }
    return !emptyCellsFound;
  }
}

Cell = function(digit, index) {
  this.digit = digit;
  this.index = index;
}

Cell.prototype = {
  isEmpty: function() {
    return this.digit === "0" ? true : false;
  },

  rowNum: function() {
    return this.digit / 9;
  },

  colNum: function() {
    return this.digit % 9;
  }
}

testGame = new Game("096040001100060004504810390007950043030080000405023018010630059059070830003590007");
