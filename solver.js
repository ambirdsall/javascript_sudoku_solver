Game = function(board) {
	this.board = board;

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
