// grid variable
let table;

// game number
let gameId = 0;

// puzzle grid
let puzzle = [];

// solution grid 
let solution = [];

// remaining number counts
let remaining = [9, 9, 9, 9, 9, 9, 9, 9, 9];

// variable to check if "Sudoku Solver" solve the puzzle
let isSolved = false;
let canSolved = true;

let intervalId;
let gameOn = false;

// return columns from a row grid
function getColumns(grid) {
    var result = ["", "", "", "", "", "", "", "", ""];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++)
            result[j] += grid[i][j];
        /*try {
            result[j] += grid[i][j];
        } catch (err) {
            alert(grid);
        }*/

    }
    return result;
}

// return blocks from a row grid
function getBlocks(grid) {
    var result = ["", "", "", "", "", "", "", "", ""];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++)
            result[Math.floor(i / 3) * 3 + Math.floor(j / 3)] += grid[i][j];
    }
    return result;
}

// function to replace char in string
function replaceCharAt(string, index, char) {
    if (index > string.length - 1) return string;
    return string.substr(0, index) + char + string.substr(index + 1);
}

// get allowed numbers that can be placed in each cell
function generatePossibleNumber(rows, columns, blocks) {
    let psb = [];

    // for each cell get numbers that are not viewed in a row, column or block
    // if the cell is not empty then, allowed number is the number already exist in it
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            psb[i * 9 + j] = "";
            if (rows[i][j] != 0) {
                psb[i * 9 + j] += rows[i][j];
            } else {
                for (var k = '1'; k <= '9'; k++) {
                    if (!rows[i].includes(k))
                        if (!columns[j].includes(k))
                            if (!blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)].includes(k))
                                psb[i * 9 + j] += k;
                }
            }
        }
    }
    return psb;
}

function solveGrid(possibleNumber, rows, startFromZero) {
    var solution = [];

    /* solve Sudoku with a backtracking algorithm
     Steps are:
      1.  get all allowed numbers that fit in each empty cell
      2.  generate all possible rows that fit in the first row depend on the allowed number list
      3.  select one row from possible row list and put it in the first row
      4.  go to next row and find all possible number that fit in each cell
      5.  generate all possible row fit in this row then go to step 3 until reach the last row or there aren't any possible rows left
      6.  if next row hasn't any possible left then go the previous row and try the next possibility from possibility rows' list
      7.  if the last row has reached and a row fit in it has found then the grid has solved
    */
    var result = nextStep(0, possibleNumber, rows, solution, startFromZero);
    if (result == 1)
        return solution;
}

// level is current row number in the grid
function nextStep(level, possibleNumber, rows, solution, startFromZero) {
    // get possible number fit in each cell in this row
    var x = possibleNumber.slice(level * 9, (level + 1) * 9);

    // generate possible numbers sequence that fit in the current row
    var y = generatePossibleRows(x);
    if (y.length == 0)
        return 0;

    // to allow check is solution is unique
    var start = startFromZero ? 0 : y.length - 1;
    var stop = startFromZero ? y.length - 1 : 0;
    var step = startFromZero ? 1 : -1;
    var condition = startFromZero ? (start <= stop) : (start >= stop);

    // try every numbers sequence in this list and go to next row
    for (var num = start; condition; num += step) {
        var condition = startFromZero ? (num + step <= stop) : (num + step >= stop);
        for (var i = level + 1; i < 9; i++)
            solution[i] = rows[i];
        solution[level] = y[num];
        if (level < 8) {
            /*if (solution[4] === undefined) {
                var x = 0;
                x++;
            }*/
            var cols = getColumns(solution);
            var blocks = getBlocks(solution);

            var poss = generatePossibleNumber(solution, cols, blocks);
            if (nextStep(level + 1, poss, rows, solution, startFromZero) == 1)
                return 1;
        }
        if (level == 8)
            return 1;
    }
    return -1;
}

// generate possible numbers sequence that fit in the current row
function generatePossibleRows(possibleNumber) {
    var result = [];

    function step(level, PossibleRow) {
        if (level == 9) {
            result.push(PossibleRow);
            return;
        }

        for (var i in possibleNumber[level]) {
            if (PossibleRow.includes(possibleNumber[level][i]))
                continue;
            step(level + 1, PossibleRow + possibleNumber[level][i]);
        }
    }

    step(0, "");

    return result;
}

// view grid in html page
function ViewPuzzle(grid) {
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            if (grid[i][j] == "0") {
                input.value = "";
            }
            else {
                input.value = grid[i][j];
                remaining[grid[i][j] - 1]--;
            }
        }
    }
}

// read current grid
function readInput() {
    var result = [];
    for (var i = 0; i < 9; i++) {
        result.push("");
        for (var j = 0; j < 9; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];
            if (input.value == "" || input.value.length > 1 || input.value == "0") {
                input.value = ""
                result[i] += "0";
            }
            else
                result[i] += input.value;
        }
    }
    return result;
}

// check value if it is correct or wrong
// return:
//  0 for value can't be changed
//  1 for correct value
//  2 for value that hasn't any conflict with other values
//  3 for value that conflict with value in its row, column or block
//  4 for incorect input
function checkValue(value, row, column, block, defaultValue, currectValue) {
    if (value === "" || value === '0')
        return 0;
    if (!(value > '0' && value < ':'))
        return 4;
    if (value === defaultValue)
        return 0;
    if ((row.indexOf(value) != row.lastIndexOf(value))
        || (column.indexOf(value) != column.lastIndexOf(value))
        || (block.indexOf(value) != block.lastIndexOf(value))) {
        return 3;
    }
    if (value !== currectValue)
        return 2;
    return 1;
}

// update value of remaining numbers in html page
function updateRemainingTable() {
    for (var i = 1; i < 10; i++) {
        var item = document.getElementById("remain-" + i);
        item.innerText = remaining[i - 1];
        item.classList.remove("red");
        item.classList.remove("gray");
        if (remaining[i - 1] === 0)
            item.classList.add("gray");
        else if (remaining[i - 1] < 0 || remaining[i - 1] > 9)
            item.classList.add("red");
    }
}

// solve sudoku function
// input: changeUI boolean true to allow function to change UI
// output:
//  0 when everything goes right
//  1 when grid is already solved
//  2 when Invalid input
//  3 when no solution
function solveSudoku(changeUI) {

    // read current state
    puzzle = readInput();

    var columns = getColumns(puzzle);
    var blocks = getBlocks(puzzle);

    // check if there is any conflict
    var errors = 0;
    var correct = 0;

    for (var i = 0; i < puzzle.length; i++) {
        for (var j = 0; j < puzzle[i].length; j++) {
            var result = checkValue(puzzle[i][j], puzzle[i], columns[j], blocks[Math.floor(i / 3) * 3 + Math.floor(j / 3)], -1, -1);
            correct = correct + ((result === 2) ? 1 : 0);
            errors = errors + ((result > 2) ? 1 : 0);
        }
    }

    // check if invalid input
    if (errors > 0) {
        canSolved = false;
        return 2;
    }

    canSolved = true;
    isSolved = true;

    // check if grid is already solved
    if (correct === 81) {
        return 1;
    }


    //read the current time
    var time = Date.now();

    // solve the grid
    solution = solveGrid(generatePossibleNumber(puzzle, columns, blocks), puzzle, true);

    // show result
    if (solution === undefined) {
        isSolved = false;
        canSolved = false;
        return 3;
    }

    if (changeUI) {
        remaining = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        updateRemainingTable();
        ViewPuzzle(solution);
    }
    return 0;
}

// function that must run when document loaded
window.onload = function () {

    // assigne table to its value
    table = document.getElementById("puzzle-grid");
    // add ripple effect to all buttons in layout
    var rippleButtons = document.getElementsByClassName("button");
    for (var i = 0; i < rippleButtons.length; i++) {
        rippleButtons[i].onmousedown = function (e) {
            // get ripple effect's position depend on mouse and button position
            var x = e.pageX - this.offsetLeft;
            var y = e.pageY - this.offsetTop;

            // add div that represents the ripple
            var rippleItem = document.createElement("div");
            rippleItem.classList.add('ripple');
            rippleItem.setAttribute("style", "left: " + x + "px; top: " + y + "px");

            // if ripple item should have special color... get and apply it 
            var rippleColor = this.getAttribute('ripple-color');
            if (rippleColor)
                rippleItem.style.background = rippleColor;
            this.appendChild(rippleItem);

            // set timer to remove the dif after the effect ends
            setTimeout(function () {
                rippleItem.parentElement.removeChild(rippleItem);
            }, 1500);
        };
    }
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var input = table.rows[i].cells[j].getElementsByTagName('input')[0];

            // add function to remove color from cells and update remaining numbers table when it get changed
            input.onchange = function () {

                //remove color from cell

                // check if the new value entered is allowed
                function checkInput(input) {
                    if (input.value[0] < '1' || input.value[0] > '9') {
                        if (input.value != "?" && input.value != "؟") {
                            input.value = "";
                            alert("only numbers [1-9] and question mark '?' are allowed!!");
                            input.focus()
                        }
                    }
                }
                checkInput(this);

                // compare old value and new value then update remaining numbers table 
                if (this.value > 0 && this.value < 10)
                    remaining[this.value - 1]--;
                if (this.oldvalue !== "") {
                    if (this.oldvalue > 0 && this.oldvalue < 10)
                        remaining[this.oldvalue - 1]++;
                }

                //reset canSolved value when change any cell
                canSolved = true;

                updateRemainingTable();
            };

            //change cell 'old value' when it got focused to track numbers and changes on grid
            input.onfocus = function () {
                this.oldvalue = this.value;
            };
        }
    }
}

// sudoku solver section
function solveButtonClick() {

    if (gameOn) {
        gameOn = false;
        clearInterval(intervalId);
    }

    var result = solveSudoku(true);
    switch (result) {
        case 0:
            alert("SOLVED");
            break;
        case 1:
            alert("This grid is already solved")
            break;
        case 2:
            alert("This grid can't be solved because of an invalid input")
            break;
        case 3:
            alert("this grid has no solution");
            break;
    }
}