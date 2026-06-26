# AI Assignment

> **Submitted by:** Rakib Hussain
> **Roll Number:** 220710007047
> **Semester:** 8

---

## Quick Run Commands

```bash
node code/alphaBetaPruning.js
node code/hmmViterbi.js
node code/ticTacToe.js
```

---

## Table of Contents

- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [How to Run](#how-to-run)
  - [1. Alpha-Beta Pruning](#1-alpha-beta-pruning)
  - [2. Hidden Markov Model — Viterbi Algorithm](#2-hidden-markov-model--viterbi-algorithm)
  - [3. Tic-Tac-Toe with Minimax AI](#3-tic-tac-toe-with-minimax-ai)
- [Algorithm Documentation](#algorithm-documentation)
- [Technical Summary](#technical-summary)

---

This project contains JavaScript (Node.js) implementations of three fundamental Artificial Intelligence algorithms:

1. **Alpha-Beta Pruning** — game tree optimization
2. **Hidden Markov Model (Viterbi Algorithm)** — hidden state inference
3. **Tic-Tac-Toe with Minimax AI** — unbeatable game AI

All scripts use **Node.js built-in modules only** — no npm install required.

---

## Project Structure

```
AI Assignment/
├── README.md                        ← You are here
├── code/
│   ├── alphaBetaPruning.js          ← Alpha-Beta pruning algorithm
│   ├── hmmViterbi.js                ← Viterbi algorithm for HMM
│   ├── ticTacToe.js                 ← Tic-Tac-Toe with Minimax AI
│   └── package.json                 ← npm run scripts
├── docs/
│   ├── alphaBetaPruning.md          ← How Alpha-Beta Pruning works
│   ├── hmmViterbi.md                ← How the Viterbi Algorithm works
│   └── ticTacToe.md                 ← How the Minimax AI works
└── results/
    ├── alpha_beta_game_tree.svg     ← Generated game tree visualization
    └── hmm_viterbi_probability_chart.svg  ← Generated probability chart
```

---

## Requirements

- **Node.js v14 or higher** — download from https://nodejs.org/
- No npm packages needed

Verify your Node.js installation:

```bash
node -v
```

---

## How to Run

All commands are run from the **root of the project** (the `AI Assignment` folder).

---

### 1. Alpha-Beta Pruning

**File:** `code/alphaBetaPruning.js`
**Docs:** `docs/alphaBetaPruning.md`

```bash
node code/alphaBetaPruning.js
```

**Expected terminal output:**
```
Executing Alpha-Beta Search...
Alpha-Beta execution completed. Optimal value: 5
Pruned structural connections detected: [["C2","L4"],["B2","C4"]]

Tree visual saved to: results/alpha_beta_game_tree.svg
Open that file in any web browser to view the annotated game tree.
```

**Generated file:** `results/alpha_beta_game_tree.svg`
Open this SVG in any web browser (Chrome, Edge, Firefox) to view:
- The full game tree with all nodes
- MAX nodes (blue ▲) and MIN nodes (pink ▽)
- Leaf values, alpha (α) and beta (β) at each node
- Pruned edges shown as dashed grey lines with a **PRUNED** badge

📖 [**Detailed Documentation → Alpha-Beta Pruning**](docs/alphaBetaPruning.md)

---

### 2. Hidden Markov Model — Viterbi Algorithm

**File:** `code/hmmViterbi.js`
**Docs:** `docs/hmmViterbi.md`

```bash
node code/hmmViterbi.js
```

**Expected terminal output:**
```
Hidden Markov Model - Viterbi Algorithm Execution

--------------------------------------------------
Time Step       | Observation     | Predicted State
--------------------------------------------------
T = 0           | Walk            | Sunny
T = 1           | Walk            | Sunny
T = 2           | Shop            | Rainy
T = 3           | Clean           | Rainy
--------------------------------------------------

Probability chart saved to: results/hmm_viterbi_probability_chart.svg
Open that file in any web browser to view the chart.
```

**Generated file:** `results/hmm_viterbi_probability_chart.svg`
Open this SVG in any web browser to view:
- A line chart with one line per hidden state (Sunny / Rainy)
- X-axis: time steps with observed events (Walk, Walk, Shop, Clean)
- Y-axis: probability values in clean decimal format
- Data point labels showing exact probabilities

📖 [**Detailed Documentation → HMM Viterbi Algorithm**](docs/hmmViterbi.md)

---

### 3. Tic-Tac-Toe with Minimax AI

**File:** `code/ticTacToe.js`
**Docs:** `docs/ticTacToe.md`

```bash
node code/ticTacToe.js
```

**How to play:**
- You play as **O**, the AI plays as **X**
- When prompted, enter the **row** (0, 1, or 2) then the **column** (0, 1, or 2)
- Board positions:
  ```
  (0,0) | (0,1) | (0,2)
  ------+-------+------
  (1,0) | (1,1) | (1,2)
  ------+-------+------
  (2,0) | (2,1) | (2,2)
  ```

**Expected terminal output (sample):**
```
Tic-Tac-Toe: Human (O) vs AI (X)

Current Board:
_ | _ | _
---------
_ | _ | _
---------
_ | _ | _
---------

Your turn.
Enter row (0, 1, or 2): 0
Enter column (0, 1, or 2): 0

Current Board:
O | _ | _
...

AI is calculating its move...
AI plays at row 1, column 1
```

> **Note:** The AI uses the Minimax algorithm and will never lose. The best outcome for the human is a draw.

> This module is interactive and does not generate any output file.

📖 [**Detailed Documentation → Tic-Tac-Toe Minimax AI**](docs/ticTacToe.md)

---

## Algorithm Documentation

Detailed documentation for each algorithm is in the `docs/` folder:

| File | Contents |
|---|---|
| [`docs/alphaBetaPruning.md`](docs/alphaBetaPruning.md) | Pruning logic, worked example, tree structure, complexity |
| [`docs/hmmViterbi.md`](docs/hmmViterbi.md) | HMM model, Viterbi phases, worked example with probabilities |
| [`docs/ticTacToe.md`](docs/ticTacToe.md) | Minimax algorithm, scoring, game flow, why AI never loses |

---

## Technical Summary

| Algorithm | Time Complexity | Space | Output |
|---|---|---|---|
| Alpha-Beta Pruning | O(b^(d/2)) best, O(b^d) worst | O(d) | SVG game tree |
| Viterbi Algorithm | O(N² × T) | O(N × T) | SVG probability chart |
| Minimax (Tic-Tac-Toe) | O(9!) worst case | O(depth) | Interactive CLI |
