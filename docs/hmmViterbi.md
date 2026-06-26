# Hidden Markov Model & Viterbi Algorithm — Documentation

## Overview

A **Hidden Markov Model (HMM)** is a statistical model used to describe systems that transition through a series of **hidden (unobservable) states**, each of which emits **observable events** with certain probabilities.

The **Viterbi Algorithm** solves the *decoding problem*: given a sequence of observations, what is the **most likely sequence of hidden states** that produced them?

---

## The Problem Being Solved

Imagine you can observe someone's daily activities (Walk, Shop, Clean) but you cannot directly see the weather (Sunny, Rainy). You want to infer the most likely sequence of weather states that explains the observed activities.

This is the classic **Weather → Activity HMM** problem.

---

## Model Parameters

### Hidden States
```
States = ['Sunny', 'Rainy']
```

### Observable Events
```
Observations = ['Walk', 'Shop', 'Clean']
```

### Initial Probabilities (π)
```
P(start = Sunny) = 0.6
P(start = Rainy) = 0.4
```

### Transition Matrix (A)
Probability of moving from one state to another:

|         | → Sunny | → Rainy |
|---------|---------|---------|
| Sunny → |  0.7    |  0.3    |
| Rainy → |  0.4    |  0.6    |

### Emission Matrix (B)
Probability of emitting an observation from a given state:

|         | Walk | Shop | Clean |
|---------|------|------|-------|
| Sunny   | 0.6  | 0.3  |  0.1  |
| Rainy   | 0.1  | 0.4  |  0.5  |

### Observation Sequence Used
```
[Walk, Walk, Shop, Clean]   →   [0, 0, 1, 2]
```

---

## How the Viterbi Algorithm Works

The Viterbi algorithm uses **dynamic programming** to find the optimal path through the hidden state space in three phases:

### Phase 1 — Initialization (t = 0)
For each state `s`, compute the probability of starting in `s` AND emitting the first observation:

```
V[s][0] = π[s] × B[s][obs[0]]
```

For t=0 (Walk observed):
```
V[Sunny][0] = 0.6 × 0.6 = 0.36
V[Rainy][0] = 0.4 × 0.1 = 0.04
```

### Phase 2 — Recursion (t = 1, 2, …, T-1)
For each state at time `t`, find the best previous state to come from:

```
V[s][t] = max over all prev_s of:
              V[prev_s][t-1] × A[prev_s][s] × B[s][obs[t]]

path[s][t] = argmax of the above
```

### Phase 3 — Backtracking
Start from the state with the highest probability at the final time step and trace back through the stored `path` pointers to reconstruct the optimal sequence.

---

## Worked Example

**Observation sequence:** Walk(0), Walk(0), Shop(1), Clean(2)

| t | Observation | Best Sunny Prob | Best Rainy Prob | Predicted State |
|---|---|---|---|---|
| 0 | Walk  | 0.36   | 0.04   | **Sunny** |
| 1 | Walk  | 0.1512 | 0.0108 | **Sunny** |
| 2 | Shop  | 0.0191 | 0.0181 | **Sunny** → switches |
| 3 | Clean | 0.00057| 0.00544| **Rainy** |

**Most likely hidden state sequence: Sunny → Sunny → Rainy → Rainy**

This makes intuitive sense: walking twice suggests sunny days, then shopping followed by cleaning suggests rain.

---

## Visualization Output

The script generates `results/hmm_viterbi_probability_chart.svg` — a line chart showing:

- **X-axis:** Time steps (T0 to T3) with the observation at each step
- **Y-axis:** Probability value at that time step
- **Blue line:** Probability for the Sunny state
- **Red line:** Probability for the Rainy state
- **Data point labels:** Exact probability values in decimal format

---

## Complexity

| Metric | Value |
|---|---|
| Time | O(N² × T) — N = number of states, T = sequence length |
| Space | O(N × T) — stores full probability and path matrices |

---

## Key Functions in `hmmViterbi.js`

| Function | Purpose |
|---|---|
| `viterbi()` | Core algorithm — builds viterbiMatrix and pathTracker, then backtracks |
| `fmtProb()` | Formats probabilities as clean decimals (no scientific notation) |
| `visualizeProbabilities()` | Generates the SVG line chart |
| `main()` | Defines model parameters, runs Viterbi, prints table, saves chart |
