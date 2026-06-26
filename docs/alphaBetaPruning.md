# Alpha-Beta Pruning — Algorithm Documentation

## Overview

Alpha-Beta Pruning is an optimization technique applied on top of the **Minimax algorithm**. It dramatically reduces the number of nodes evaluated in a game tree by cutting off branches that cannot possibly affect the final decision. The name comes from two values — **alpha** (the best score the maximizer can guarantee) and **beta** (the best score the minimizer can guarantee).

---

## Problem It Solves

In a two-player zero-sum game, the Minimax algorithm exhaustively explores every possible move. For a tree with branching factor `b` and depth `d`, it evaluates **O(b^d)** nodes. Alpha-Beta pruning reduces this to **O(b^(d/2))** in the best case — effectively allowing the AI to look **twice as deep** in the same time.

---

## How the Algorithm Works

### Core Idea

At every node, two values are maintained:

| Variable | Maintained by | Meaning |
|---|---|---|
| `α` (alpha) | Maximizer | The best score the maximizer has found so far |
| `β` (beta)  | Minimizer | The best score the minimizer has found so far |

When `β ≤ α` at any point, the current branch can be **pruned** — the opponent would never allow the game to reach this state.

### Step-by-Step Execution

```
alphaBetaVisual(node, α = -∞, β = +∞, isMaximizing):

  1. If node is a LEAF → return its value

  2. If isMaximizing:
       bestVal = -∞
       for each child:
           value = alphaBetaVisual(child, α, β, false)
           bestVal = max(bestVal, value)
           α = max(α, bestVal)
           if β ≤ α → PRUNE remaining siblings (break)
       return bestVal

  3. If isMinimizing:
       bestVal = +∞
       for each child:
           value = alphaBetaVisual(child, α, β, true)
           bestVal = min(bestVal, value)
           β = min(β, bestVal)
           if β ≤ α → PRUNE remaining siblings (break)
       return bestVal
```

### The Game Tree Used

```
                    Root (MAX)
                   /          \
              B1 (MIN)        B2 (MIN)
             /      \         /      \
         C1(MAX)  C2(MAX)  C3(MAX)  C4(MAX)  ← C4 is pruned entirely
          / \      / \      / \      / \
         L1  L2  L3  L4  L5  L6  L7  L8
         3   5   6   9   1   2   0  -2
                     ↑                ↑
                  Pruned            Never
                   (L4)            visited
```

- **L4 (value 9)** is pruned because C2 already found 6, which exceeds β=5 from B1.
- **C4** (and L7, L8) is pruned entirely because B2 already returned 2 ≤ α=5 from Root.

---

## Pruning Logic Explained

After evaluating **C1 → {L1=3, L2=5}**, the maximizer at C1 sets α=5.  
B1 (minimizer) sees that bestVal=5, so β=5.

When C2 evaluates L3=6:
- C2's alpha becomes 6.
- β(5) ≤ α(6) → **pruning triggered**. L4 is never evaluated.

After B1 returns 5, Root's alpha becomes 5.

When C3 evaluates {L5=1, L6=2}:
- B2's bestVal=2, β=2.
- α(5) ≥ β(2) → **pruning triggered**. C4 (and its leaves L7, L8) is never visited.

---

## Visualization Output

The script generates `results/alpha_beta_game_tree.svg` showing:

| Visual Element | Meaning |
|---|---|
| **Blue upward triangle (▲)** | MAX node |
| **Pink downward triangle (▽)** | MIN node |
| **Green rectangle** | Evaluated leaf node |
| **Grey rectangle** | Pruned (never visited) leaf |
| **Solid blue edge** | Normal evaluated connection |
| **Dashed grey edge + PRUNED badge** | Pruned connection |
| **α / β labels on each node** | Final alpha/beta values at that node |

---

## Complexity

| Metric | Value |
|---|---|
| Best case | O(b^(d/2)) — perfect ordering |
| Worst case | O(b^d) — no pruning occurs |
| Space | O(d) — only the current path is on the stack |

---

## Key Functions in `alphaBetaPruning.js`

| Function | Purpose |
|---|---|
| `VisualTreeNode` | Node class holding value, alpha, beta, visited flag |
| `alphaBetaVisual()` | Recursive Alpha-Beta search; records pruned edges |
| `assignPositions()` | Calculates (x, y) coordinates for SVG layout |
| `renderSVG()` | Builds and saves the game tree as an SVG file |
| `main()` | Constructs the tree, runs the search, saves the output |
