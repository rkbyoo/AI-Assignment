/**
 * Tic-Tac-Toe with AI (Minimax Algorithm)
 * 
 * An interactive Tic-Tac-Toe game where you play against an AI opponent
 * powered by the Minimax algorithm (same logic as tic_tac_toe.py).
 * 
 * Run: node tic_tac_toe.js
 * 
 * Board positions:
 *   0 | 1 | 2
 *   ---------
 *   3 | 4 | 5
 *   ---------
 *   6 | 7 | 8
 * 
 * You play as 'O', the AI plays as 'X'.
 */

const readline = require('readline');

// Define the players
const AI_PLAYER    = 'X';
const HUMAN_PLAYER = 'O';
const EMPTY_CELL   = '_';

// ---------------------------------------------------------------------------
// Board helpers
// ---------------------------------------------------------------------------

/**
 * Prints the current state of the Tic-Tac-Toe board to the console.
 * @param {string[][]} board - 3×3 grid
 */
function printBoard(board) {
    console.log('\nCurrent Board:');
    for (const row of board) {
        console.log(row.join(' | '));
        console.log('-'.repeat(9));
    }
}

/**
 * Checks if there are any empty cells remaining on the board.
 * @param {string[][]} board
 * @returns {boolean} true if moves are left
 */
function isMovesLeft(board) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === EMPTY_CELL) return true;
        }
    }
    return false;
}

/**
 * Evaluates the board to check for a win state.
 * @param {string[][]} board
 * @returns {number} +10 if AI wins, -10 if Human wins, 0 for draw/incomplete
 */
function evaluate(board) {
    // Check rows for a victory
    for (let row = 0; row < 3; row++) {
        if (board[row][0] === board[row][1] && board[row][1] === board[row][2]) {
            if (board[row][0] === AI_PLAYER)    return 10;
            if (board[row][0] === HUMAN_PLAYER) return -10;
        }
    }

    // Check columns for a victory
    for (let col = 0; col < 3; col++) {
        if (board[0][col] === board[1][col] && board[1][col] === board[2][col]) {
            if (board[0][col] === AI_PLAYER)    return 10;
            if (board[0][col] === HUMAN_PLAYER) return -10;
        }
    }

    // Check diagonals for a victory
    if (board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        if (board[0][0] === AI_PLAYER)    return 10;
        if (board[0][0] === HUMAN_PLAYER) return -10;
    }

    if (board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
        if (board[0][2] === AI_PLAYER)    return 10;
        if (board[0][2] === HUMAN_PLAYER) return -10;
    }

    // No winner yet or game is a draw
    return 0;
}

// ---------------------------------------------------------------------------
// Minimax
// ---------------------------------------------------------------------------

/**
 * The Minimax recursive function.
 * Explores all possible moves to determine the optimal score.
 *
 * @param {string[][]} board
 * @param {number} depth
 * @param {boolean} isMaximizing
 * @returns {number}
 */
function minimax(board, depth, isMaximizing) {
    const score = evaluate(board);

    // Base cases: return score if terminal state is reached
    if (score === 10)  return score - depth; // Subtract depth to prefer faster wins
    if (score === -10) return score + depth; // Add depth to prefer slower losses
    if (!isMovesLeft(board)) return 0;

    if (isMaximizing) {
        let bestVal = -Infinity;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (board[row][col] === EMPTY_CELL) {
                    // Make a tentative move
                    board[row][col] = AI_PLAYER;
                    // Call minimax recursively
                    const value = minimax(board, depth + 1, false);
                    bestVal = Math.max(bestVal, value);
                    // Undo the move
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
                    // Make a tentative move
                    board[row][col] = HUMAN_PLAYER;
                    // Call minimax recursively
                    const value = minimax(board, depth + 1, true);
                    bestVal = Math.min(bestVal, value);
                    // Undo the move
                    board[row][col] = EMPTY_CELL;
                }
            }
        }
        return bestVal;
    }
}

/**
 * Iterates through all empty cells to find the best move for the AI.
 * @param {string[][]} board
 * @returns {{ row: number, col: number }}
 */
function findBestMove(board) {
    let bestVal = -Infinity;
    let bestMove = { row: -1, col: -1 };

    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[row][col] === EMPTY_CELL) {
                // Make a tentative move
                board[row][col] = AI_PLAYER;
                // Evaluate this move using minimax
                const moveVal = minimax(board, 0, false);
                // Undo the move
                board[row][col] = EMPTY_CELL;

                // Update best move if current move is better
                if (moveVal > bestVal) {
                    bestMove = { row, col };
                    bestVal = moveVal;
                }
            }
        }
    }

    return bestMove;
}

// ---------------------------------------------------------------------------
// Game loop (async readline-based interactive CLI)
// ---------------------------------------------------------------------------

/**
 * Prompts the user for a single line of text.
 * @param {readline.Interface} rl
 * @param {string} question
 * @returns {Promise<string>}
 */
function prompt(rl, question) {
    return new Promise(resolve => rl.question(question, resolve));
}

/**
 * Main execution loop to play the game in the terminal.
 */
async function main() {
    // Initialize an empty 3x3 board
    const board = [
        [EMPTY_CELL, EMPTY_CELL, EMPTY_CELL],
        [EMPTY_CELL, EMPTY_CELL, EMPTY_CELL],
        [EMPTY_CELL, EMPTY_CELL, EMPTY_CELL],
    ];

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    console.log('Tic-Tac-Toe: Human (O) vs AI (X)');
    printBoard(board);

    while (isMovesLeft(board)) {
        // ── Human turn ──────────────────────────────────────────────────────
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

        if (evaluate(board) === -10) {
            console.log('You win! (This should be impossible against Minimax)');
            break;
        }
        if (!isMovesLeft(board)) {
            console.log("It's a draw!");
            break;
        }

        // ── AI turn ─────────────────────────────────────────────────────────
        console.log('\nAI is calculating its move...');
        const { row: aiRow, col: aiCol } = findBestMove(board);
        board[aiRow][aiCol] = AI_PLAYER;
        console.log(`AI plays at row ${aiRow}, column ${aiCol}`);
        printBoard(board);

        if (evaluate(board) === 10) {
            console.log('AI wins!');
            break;
        }
        if (!isMovesLeft(board)) {
            console.log("It's a draw!");
            break;
        }
    }

    rl.close();
}

main().catch(err => {
    console.error('[ERROR]', err.message);
    process.exit(1);
});
