/**
 * Run commands:
 *   1. node code/alphaBetaPruning.js
 *   2. node code/hmmViterbi.js
 *   3. node code/ticTacToe.js          ← this file
 */

const readline = require('readline');

const AI_PLAYER    = 'X';
const HUMAN_PLAYER = 'O';
const EMPTY_CELL   = '_';

// --- Board Helpers ---

function printBoard(board) {
    console.log('\nCurrent Board:');
    for (const row of board) {
        console.log(row.join(' | '));
        console.log('-'.repeat(9));
    }
}

function isMovesLeft(board) {
    for (let row = 0; row < 3; row++)
        for (let col = 0; col < 3; col++)
            if (board[row][col] === EMPTY_CELL) return true;
    return false;
}

// Returns +10 (AI wins), -10 (Human wins), or 0
function evaluate(board) {
    for (let row = 0; row < 3; row++) {
        if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
            if (board[row][0] === AI_PLAYER)    return 10;
            if (board[row][0] === HUMAN_PLAYER) return -10;
        }
    }
    for (let col = 0; col < 3; col++) {
        if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
            if (board[0][col] === AI_PLAYER)    return 10;
            if (board[0][col] === HUMAN_PLAYER) return -10;
        }
    }
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        if (board[0][0] === AI_PLAYER)    return 10;
        if (board[0][0] === HUMAN_PLAYER) return -10;
    }
    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        if (board[0][2] === AI_PLAYER)    return 10;
        if (board[0][2] === HUMAN_PLAYER) return -10;
    }
    return 0;
}

// --- Minimax ---

function minimax(board, depth, isMaximizing) {
    const score = evaluate(board);
    if (score === 10)  return score - depth;
    if (score === -10) return score + depth;
    if (!isMovesLeft(board)) return 0;

    if (isMaximizing) {
        let bestVal = -Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === EMPTY_CELL) {
                    board[row][col] = AI_PLAYER;
                    bestVal = Math.max(bestVal, minimax(board, depth + 1, false));
                    board[row][col] = EMPTY_CELL;
                }
            }
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === EMPTY_CELL) {
                    board[row][col] = HUMAN_PLAYER;
                    bestVal = Math.min(bestVal, minimax(board, depth + 1, true));
                    board[row][col] = EMPTY_CELL;
                }
            }
        }
        return bestVal;
    }
}

function findBestMove(board) {
    let bestVal  = -Infinity;
    let bestMove = { row: -1, col: -1 };

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === EMPTY_CELL) {
                board[row][col] = AI_PLAYER;
                const moveVal   = minimax(board, 0, false);
                board[row][col] = EMPTY_CELL;
                if (moveVal > bestVal) {
                    bestMove = { row, col };
                    bestVal  = moveVal;
                }
            }
        }
    }
    return bestMove;
}

// --- Game Loop ---

function prompt(rl, question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function main() {
    const board = [
        [EMPTY_CELL, EMPTY_CELL, EMPTY_CELL],
        [EMPTY_CELL, EMPTY_CELL, EMPTY_CELL],
        [EMPTY_CELL, EMPTY_CELL, EMPTY_CELL],
    ];

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log('Tic-Tac-Toe: Human (O) vs AI (X)');
    printBoard(board);

    while (isMovesLeft(board)) {
        // Human turn
        console.log('\nYour turn.');
        let row, col;
        try {
            const rowStr = await prompt(rl, 'Enter row (0, 1, or 2): ');
            const colStr = await prompt(rl, 'Enter column (0, 1, or 2): ');
            row = parseInt(rowStr, 10);
            col = parseInt(colStr, 10);
            if (isNaN(row) || isNaN(col)) throw new Error('NaN');
        } catch {
            console.log('Invalid input. Please enter numbers.');
            continue;
        }

        if (row < 0 || row > 2 || col < 0 || col > 2 || board[row][col] !== EMPTY_CELL) {
            console.log('Invalid move. Cell is either out of bounds or already occupied.');
            continue;
        }

        board[row][col] = HUMAN_PLAYER;
        printBoard(board);

        if (evaluate(board) === -10) { console.log('You win! (This should be impossible against Minimax)'); break; }
        if (!isMovesLeft(board))     { console.log("It's a draw!"); break; }

        // AI turn
        console.log('\nAI is calculating its move...');
        const { row: aiRow, col: aiCol } = findBestMove(board);
        board[aiRow][aiCol] = AI_PLAYER;
        console.log(`AI plays at row ${aiRow}, column ${aiCol}`);
        printBoard(board);

        if (evaluate(board) === 10) { console.log('AI wins!'); break; }
        if (!isMovesLeft(board))    { console.log("It's a draw!"); break; }
    }

    rl.close();
}

main().catch(err => {
    console.error('[ERROR]', err.message);
    process.exit(1);
});
