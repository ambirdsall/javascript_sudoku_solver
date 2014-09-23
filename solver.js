Game = function(boardString) {
	this.boardSize = 81;
	try {
		this.makeBoard(boardString);
	} catch(e) {
		console.log(e)
	}
}

Game.prototype = {
	makeBoard: function(boardString) {
		if (boardString.length !== this.boardSize) {
			throw "Invalid board string";
		}

		this.board = [];

		for (var i=0; i<this.boardSize; i++) {
			this.board.push(new Cell(boardString.charAt(i)))
		}
	}
}

Cell = function(digit) {
	this.digit = digit;
}

Cell.prototype = {
	isEmpty: function() {
		return (this.digit === 0 ? true : false);
	},

	rowNum: function() {
		return this.digit / 9;
	},
	
	colNum: function() {
		return this.digit % 9;
	}
}

testGame = new Game("096040001100060004504810390007950043030080000405023018010630059059070830003590007");
