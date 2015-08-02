describe("sudoku solver", function() {
  var easy      = new Game("005030081902850060600004050007402830349760005008300490150087002090000600026049503"),
      hard      = new Game("850002400720000009004000000000107002305000900040000000000080070017000000000036040"),
      firstCell = easy.board[0];

  it("should have an empty first cell", function(){
    expect(firstCell.isEmpty()).toBe(true);
  });
  it("should not be solved yet", function() {
    expect(easy.isSolved()).toBe(false);
  });
  it("should group rows properly", function() {
    var firstRow = firstCell.getSameRow()
    expect(firstRow).toEqual([1,2,3,4,5,6,7,8])
  })
  // It feels atrociously hacky to leave half the indeces as strings and cast
  // half to integers. Good grief.
  it("should group all related cells properly", function() {
    expect(firstCell.relatedCells).toEqual(["1","2","3","4","5","6","7","8","9","10","11","18","19","20","27","36","45","54","63","72"]);
  })
  it("should solve a board", function() {
    easy.solve();
    expect(easy.isSolved()).toBe(true);
  })
  it("should solve a hard board", function() {
    expect(hard.isSolved()).toBe(false);
    hard.solve();
    expect(hard.isSolved()).toBe(true);
  })
});
