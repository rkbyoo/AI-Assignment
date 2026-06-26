# Tic-Tac-Toe with Minimax AI — Documentation

## Overview

This module implements an interactive **Tic-Tac-Toe** game in the terminal where a human player competes against an AI powered by the **Minimax algorithm**. The AI plays perfectly — it will never lose. The best a human can do is force a draw.

---

## The Game

### Board Layout
```
 Row\Col   0     1     2
   0    (0,0) | (0,1) | (0,2)
        ------+-------+------
   1    (1,0) | (1,1) | (1,2)
        ------+-------+------
   2    (2,0) | (2,1) | (2,2)
```

- **You play as `O`** (human)
- **AI plays as `X`**
- Empty cells are shown as `_`

### Win Conditions
A player wins if they fill any:
- Horizontal row (3 in a row)
- Vertical column (3 in a column)
- Either diagonal

---

## How the Minimax Algorithm Works

Minimax is a **recursive decision-making algorithm** used in two-player, zero-sum games. It assumes both players play optimally.

### Core Concept

The algorithm explores the **entire game tree** from the current board state:
- **Maximizer (AI = X):** Tries to achieve the highest possible score
- **Minimizer (Human = O):** Tries to achieve the lowest possible score

### Scoring System

```
 +10  → AI wins
 -10  → Human wins
   0  → Draw or game still in progress
```

A **depth penalty** is applied to prefer faster wins and delay losses:
```
AI wins at depth d:    score = 10 - d   (prefer quicker wins)
Human wins at depth d: score = -10 + d  (delay losses as long as possible)
```

### Algorithm Pseudocode

```
minimax(board, depth, isMaximizing):

  score = evaluate(board)

  if score == 10  → return 10 - depth    // AI wins, prefer fast
  if score == -10 → return -10 + depth   // Human wins, delay
  if no moves left → return 0            // Draw

  if isMaximizing:
    bestVal = -∞
    for each empty cell:
      place X on cell
      value = minimax(board, depth+1, false)
      bestVal = max(bestVal, value)
      remove X from cell
    return bestVal

  else:  // isMinimizing
    bestVal = +∞
    for each empty cell:
      place O on cell
      value = minimax(board, depth+1, true)
      bestVal = min(bestVal, value)
      remove O from cell
    return bestVal
```

### Finding the Best Move

`findBestMove()` iterates over all empty cells, calls `minimax()` for each tentative move, and returns the (row, col) that yields the **highest score** for the AI.

---

## Game Flow

```
START
  │
  ▼
Print empty board
  │
  ▼
┌─────────────────────────────────┐
│  Human's turn                   │
│  - Input row (0/1/2)            │
│  - Input column (0/1/2)         │
│  - Validate move                │
│  - Place O on board             │
│  - Check: human wins or draw?   │
└─────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────┐
│  AI's turn                      │
│  - Call findBestMove()          │
│  - Place X on best cell         │
│  - Check: AI wins or draw?      │
└─────────────────────────────────┘
  │
  ▼
Repeat until win or draw
```

---

## Why the AI Never Loses

Minimax with a 3×3 board has a game tree of at most 9! = 362,880 leaf nodes. The algorithm explores **all of them** (no pruning applied here), ensuring it always picks the globally optimal move regardless of what the human plays.

The result:
- If the human plays perfectly → **Draw**
- If the human makes any mistake → **AI wins**

---

## Key Functions in `ticTacToe.js`

| Function | Purpose |
|---|---|
| `printBoard()` | Displays the current 3×3 board to the console |
| `isMovesLeft()` | Returns `true` if any empty cell remains |
| `evaluate()` | Checks rows, columns, diagonals for a win; returns +10/-10/0 |
| `minimax()` | Recursive Minimax with depth tracking |
| `findBestMove()` | Iterates all empty cells and returns the optimal (row, col) |
| `prompt()` | Async wrapper around `readline.question` |
| `main()` | Async game loop — alternates human and AI turns |
