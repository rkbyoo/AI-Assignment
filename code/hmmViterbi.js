/**
 * Hidden Markov Model - Viterbi Algorithm
 *
 * Finds the most likely sequence of hidden states for a given observation sequence.
 * Outputs a probability table to the terminal and saves an SVG chart to results/.
 * No npm packages required — pure Node.js built-ins only.
 *
 * Run: node code/hmmViterbi.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Core Algorithm
// ---------------------------------------------------------------------------

/**
 * Executes the Viterbi algorithm to find the most likely sequence of hidden states.
 *
 * @param {number[]}   obsSeq  - Sequence of integer indices representing observations
 * @param {string[]}   states  - List of hidden state names
 * @param {number[]}   startP  - Initial state probabilities  [numStates]
 * @param {number[][]} transP  - Transition matrix            [numStates][numStates]
 * @param {number[][]} emitP   - Emission matrix              [numStates][numObs]
 * @returns {{ optimalPath: string[], viterbiMatrix: number[][] }}
 */
function viterbi(obsSeq, states, startP, transP, emitP) {
    const numStates = states.length;
    const numObs    = obsSeq.length;

    // Initialize the probability matrix (V) and the path tracker (P)
    // viterbiMatrix[state][time] — maximum probability of reaching state at time t
    const viterbiMatrix = Array.from({ length: numStates }, () => new Array(numObs).fill(0));
    // pathTracker[state][time]  — previous state that produced the maximum probability
    const pathTracker   = Array.from({ length: numStates }, () => new Array(numObs).fill(0));

    // Base Case: Initialize the first column for time t=0
    const firstObs = obsSeq[0];
    for (let s = 0; s < numStates; s++) {
        viterbiMatrix[s][0] = startP[s] * emitP[s][firstObs];
    }

    // Recursive Step: Compute probabilities for time t > 0
    for (let t = 1; t < numObs; t++) {
        const currentObs = obsSeq[t];
        for (let currentState = 0; currentState < numStates; currentState++) {
            // Calculate probabilities of transitioning from all previous states
            const transitionProbs = viterbiMatrix.map(
                (row, prevState) =>
                    row[t - 1] * transP[prevState][currentState] * emitP[currentState][currentObs]
            );

            // Store the maximum probability and the state index that provided it
            const maxProb    = Math.max(...transitionProbs);
            const argmaxState = transitionProbs.indexOf(maxProb);
            viterbiMatrix[currentState][t] = maxProb;
            pathTracker[currentState][t]   = argmaxState;
        }
    }

    // Backtracking: Find the optimal path starting from the last time step
    const bestPath = new Array(numObs).fill(0);
    const lastCol  = viterbiMatrix.map(row => row[numObs - 1]);
    bestPath[numObs - 1] = lastCol.indexOf(Math.max(...lastCol));

    for (let t = numObs - 2; t >= 0; t--) {
        bestPath[t] = pathTracker[bestPath[t + 1]][t + 1];
    }

    // Convert state indices back to string labels
    const optimalPath = bestPath.map(i => states[i]);

    return { optimalPath, viterbiMatrix };
}

// ---------------------------------------------------------------------------
// SVG Chart (pure JS, zero dependencies — equivalent to matplotlib output)
// ---------------------------------------------------------------------------

/**
 * Generates a line chart SVG showing the probability of each hidden state at
 * each time step, then saves it as 'hmm_probability_plot.svg'.
 *
 * @param {number[][]} viterbiMatrix - [numStates][numObs]
 * @param {string[]}   states
 * @param {number[]}   observations  - Observation index sequence
 * @param {string[]}   obsLabels     - Observable event names
 */
function visualizeProbabilities(viterbiMatrix, states, observations, obsLabels) {
    // ── Chart dimensions ────────────────────────────────────────────────────
    /**
     * Format a probability as a plain decimal string (no scientific notation).
     * Keeps up to 4 significant decimal digits and strips trailing zeros.
     * e.g. 0.036 → "0.036", 0.10080 → "0.1008", 0.36 → "0.36"
     * @param {number} v
     * @returns {string}
     */
    function fmtProb(v) {
        if (v === 0) return '0';
        // Find how many decimal places we need to show 4 significant figures
        const magnitude = Math.floor(Math.log10(Math.abs(v)));
        const decimals  = Math.max(0, 4 - (magnitude + 1));
        return parseFloat(v.toFixed(Math.max(decimals, 2))).toString();
    }

    const W        = 900;
    const H        = 520;
    const PAD_L    = 80;   // left   (y-axis labels)
    const PAD_R    = 30;
    const PAD_T    = 60;   // top    (title)
    const PAD_B    = 70;   // bottom (x-axis labels)
    const CHART_W  = W - PAD_L - PAD_R;
    const CHART_H  = H - PAD_T - PAD_B;

    const numObs    = observations.length;
    const numStates = states.length;

    // Color palette (matches matplotlib default cycle)
    const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316'];

    // ── Helper: map data coords → SVG pixel coords ──────────────────────────
    /** @param {number} t   time step index (0 … numObs-1) */
    const xOf = t => PAD_L + (t / (numObs - 1)) * CHART_W;

    // Find max probability across all states/times for y-axis scaling
    const allProbs = viterbiMatrix.flat();
    const maxP     = Math.max(...allProbs) * 1.1 || 1;
    /** @param {number} p   probability */
    const yOf = p => PAD_T + CHART_H - (p / maxP) * CHART_H;

    // ── Build SVG string ─────────────────────────────────────────────────────
    const lines = [];

    // Header
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Arial, sans-serif">`);

    // Background
    lines.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);

    // Title
    lines.push(
        `<text x="${W / 2}" y="30" text-anchor="middle" font-size="15" font-weight="bold" fill="#111">` +
        `HMM State Probabilities Over Time (Viterbi Algorithm)</text>`
    );

    // Horizontal grid lines (6 divisions)
    const GRID_STEPS = 5;
    for (let g = 0; g <= GRID_STEPS; g++) {
        const p  = (g / GRID_STEPS) * maxP;
        const gy = yOf(p);
        const pLabel = fmtProb(p);
        lines.push(
            `<line x1="${PAD_L}" y1="${gy}" x2="${PAD_L + CHART_W}" y2="${gy}" ` +
            `stroke="#d1d5db" stroke-dasharray="4 4" stroke-width="1"/>`
        );
        lines.push(
            `<text x="${PAD_L - 8}" y="${gy + 4}" text-anchor="end" font-size="11" fill="#555">${pLabel}</text>`
        );
    }

    // Axes
    lines.push(
        `<line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${PAD_T + CHART_H}" stroke="#374151" stroke-width="2"/>`
    );
    lines.push(
        `<line x1="${PAD_L}" y1="${PAD_T + CHART_H}" x2="${PAD_L + CHART_W}" y2="${PAD_T + CHART_H}" stroke="#374151" stroke-width="2"/>`
    );

    // X-axis labels (time steps)
    for (let t = 0; t < numObs; t++) {
        const cx    = xOf(t);
        const label = `T${t} (${obsLabels[observations[t]]})`;
        lines.push(
            `<text x="${cx}" y="${PAD_T + CHART_H + 20}" text-anchor="middle" font-size="12" fill="#374151">${label}</text>`
        );
        // Tick mark
        lines.push(
            `<line x1="${cx}" y1="${PAD_T + CHART_H}" x2="${cx}" y2="${PAD_T + CHART_H + 5}" stroke="#374151" stroke-width="1.5"/>`
        );
    }

    // X-axis title
    lines.push(
        `<text x="${PAD_L + CHART_W / 2}" y="${H - 10}" text-anchor="middle" font-size="13" fill="#374151">` +
        `Time Step (Observation)</text>`
    );

    // Y-axis title
    lines.push(
        `<text x="15" y="${PAD_T + CHART_H / 2}" text-anchor="middle" font-size="13" fill="#374151" ` +
        `transform="rotate(-90, 15, ${PAD_T + CHART_H / 2})">Probability</text>`
    );

    // Data lines + circles
    for (let si = 0; si < numStates; si++) {
        const color = COLORS[si % COLORS.length];
        const probs = viterbiMatrix[si];

        // Polyline
        const points = probs.map((p, t) => `${xOf(t).toFixed(2)},${yOf(p).toFixed(2)}`).join(' ');
        lines.push(
            `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`
        );

        // Data point circles + probability labels
        for (let t = 0; t < numObs; t++) {
            const cx = xOf(t);
            const cy = yOf(probs[t]);
            lines.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="6" fill="${color}" stroke="#fff" stroke-width="1.5"/>`);
            lines.push(
                `<text x="${cx.toFixed(2)}" y="${(cy - 10).toFixed(2)}" text-anchor="middle" font-size="10" fill="${color}">` +
                `${fmtProb(probs[t])}</text>`
            );
        }
    }

    // Legend
    const LEG_X = PAD_L + CHART_W - 10;
    const LEG_Y = PAD_T + 10;
    const LEG_BOX_W = 130;
    const LEG_ROW_H = 22;
    lines.push(
        `<rect x="${LEG_X - LEG_BOX_W}" y="${LEG_Y}" width="${LEG_BOX_W}" height="${numStates * LEG_ROW_H + 10}" ` +
        `rx="5" fill="#f9fafb" stroke="#d1d5db" stroke-width="1"/>`
    );
    for (let si = 0; si < numStates; si++) {
        const color = COLORS[si % COLORS.length];
        const ly    = LEG_Y + 10 + si * LEG_ROW_H;
        lines.push(`<line x1="${LEG_X - LEG_BOX_W + 10}" y1="${ly + 8}" x2="${LEG_X - LEG_BOX_W + 30}" y2="${ly + 8}" stroke="${color}" stroke-width="2.5"/>`);
        lines.push(`<circle cx="${LEG_X - LEG_BOX_W + 20}" cy="${ly + 8}" r="4" fill="${color}"/>`);
        lines.push(`<text x="${LEG_X - LEG_BOX_W + 36}" y="${ly + 13}" font-size="12" fill="#111">${states[si]}</text>`);
    }

    lines.push('</svg>');

    // ── Write file ───────────────────────────────────────────────────────────
    const resultsDir     = path.join(__dirname, '..', 'results');
    fs.mkdirSync(resultsDir, { recursive: true });
    const outputFilename = path.join(resultsDir, 'hmm_viterbi_probability_chart.svg');
    fs.writeFileSync(outputFilename, lines.join('\n'), 'utf8');
    console.log(`\nProbability chart saved to: results/hmm_viterbi_probability_chart.svg`);
    console.log(`Open that file in any web browser to view the chart.`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
    // 1. Define the parameters of the model
    const hiddenStates     = ['Sunny', 'Rainy'];
    const observableEvents = ['Walk', 'Shop', 'Clean'];

    // Initial probabilities: 60% chance it starts Sunny, 40% Rainy
    const startProbabilities = [0.6, 0.4];

    // Transition probabilities:
    // [Sunny->Sunny, Sunny->Rainy]
    // [Rainy->Sunny, Rainy->Rainy]
    const transitionMatrix = [
        [0.7, 0.3],
        [0.4, 0.6],
    ];

    // Emission probabilities:
    // [Sunny emits Walk, Sunny emits Shop, Sunny emits Clean]
    // [Rainy emits Walk, Rainy emits Shop, Rainy emits Clean]
    const emissionMatrix = [
        [0.6, 0.3, 0.1],
        [0.1, 0.4, 0.5],
    ];

    // 2. Define the observation sequence to test
    // Sequence: Walk (0), Walk (0), Shop (1), Clean (2)
    const obsSequence = [0, 0, 1, 2];

    // 3. Execute Viterbi
    const { optimalPath: predictedStates, viterbiMatrix: probMatrix } = viterbi(
        obsSequence,
        hiddenStates,
        startProbabilities,
        transitionMatrix,
        emissionMatrix
    );

    // 4. Terminal Output Display
    console.log('Hidden Markov Model - Viterbi Algorithm Execution\n');
    console.log('-'.repeat(50));

    const col1 = 'Time Step'.padEnd(15);
    const col2 = 'Observation'.padEnd(15);
    const col3 = 'Predicted State'.padEnd(15);
    console.log(`${col1} | ${col2} | ${col3}`);
    console.log('-'.repeat(50));

    for (let t = 0; t < obsSequence.length; t++) {
        const obsName   = observableEvents[obsSequence[t]];
        const stateName = predictedStates[t];
        console.log(
            `${'T = ' + t}`.padEnd(15) + ' | ' +
            obsName.padEnd(15)          + ' | ' +
            stateName.padEnd(15)
        );
    }
    console.log('-'.repeat(50));

    // 5. Graphical Output Generation
    visualizeProbabilities(probMatrix, hiddenStates, obsSequence, observableEvents);
}

main();
