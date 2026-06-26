/**
 * Run commands:
 *   1. node code/alphaBetaPruning.js
 *   2. node code/hmmViterbi.js         ← this file
 *   3. node code/ticTacToe.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// --- Viterbi Algorithm ---

function viterbi(obsSeq, states, startP, transP, emitP) {
    const numStates = states.length;
    const numObs    = obsSeq.length;

    // viterbiMatrix[state][time] — max probability of reaching state at time t
    const viterbiMatrix = Array.from({ length: numStates }, () => new Array(numObs).fill(0));
    // pathTracker[state][time] — previous state that gave the max probability
    const pathTracker   = Array.from({ length: numStates }, () => new Array(numObs).fill(0));

    // Base case: t = 0
    const firstObs = obsSeq[0];
    for (let s = 0; s < numStates; s++) {
        viterbiMatrix[s][0] = startP[s] * emitP[s][firstObs];
    }

    // Recursive step: t > 0
    for (let t = 1; t < numObs; t++) {
        const currentObs = obsSeq[t];
        for (let currentState = 0; currentState < numStates; currentState++) {
            const transitionProbs = viterbiMatrix.map(
                (row, prevState) =>
                    row[t - 1] * transP[prevState][currentState] * emitP[currentState][currentObs]
            );
            const maxProb         = Math.max(...transitionProbs);
            const argmaxState     = transitionProbs.indexOf(maxProb);
            viterbiMatrix[currentState][t] = maxProb;
            pathTracker[currentState][t]   = argmaxState;
        }
    }

    // Backtrack to find the optimal path
    const bestPath = new Array(numObs).fill(0);
    const lastCol  = viterbiMatrix.map(row => row[numObs - 1]);
    bestPath[numObs - 1] = lastCol.indexOf(Math.max(...lastCol));

    for (let t = numObs - 2; t >= 0; t--) {
        bestPath[t] = pathTracker[bestPath[t + 1]][t + 1];
    }

    const optimalPath = bestPath.map(i => states[i]);
    return { optimalPath, viterbiMatrix };
}

// --- SVG Chart ---

function visualizeProbabilities(viterbiMatrix, states, observations, obsLabels) {
    // Format probability as plain decimal (no scientific notation)
    function fmtProb(v) {
        if (v === 0) return '0';
        const magnitude = Math.floor(Math.log10(Math.abs(v)));
        const decimals  = Math.max(0, 4 - (magnitude + 1));
        return parseFloat(v.toFixed(Math.max(decimals, 2))).toString();
    }

    const W       = 900;
    const H       = 520;
    const PAD_L   = 80;
    const PAD_R   = 30;
    const PAD_T   = 60;
    const PAD_B   = 70;
    const CHART_W = W - PAD_L - PAD_R;
    const CHART_H = H - PAD_T - PAD_B;

    const numObs    = observations.length;
    const numStates = states.length;
    const COLORS    = ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7', '#f97316'];

    const xOf    = t => PAD_L + (t / (numObs - 1)) * CHART_W;
    const allProbs = viterbiMatrix.flat();
    const maxP     = Math.max(...allProbs) * 1.1 || 1;
    const yOf    = p => PAD_T + CHART_H - (p / maxP) * CHART_H;

    const lines = [];

    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Arial, sans-serif">`);
    lines.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
    lines.push(
        `<text x="${W / 2}" y="30" text-anchor="middle" font-size="15" font-weight="bold" fill="#111">` +
        `HMM State Probabilities Over Time (Viterbi Algorithm)</text>`
    );

    // Grid lines
    for (let g = 0; g <= 5; g++) {
        const p  = (g / 5) * maxP;
        const gy = yOf(p);
        lines.push(
            `<line x1="${PAD_L}" y1="${gy}" x2="${PAD_L + CHART_W}" y2="${gy}" ` +
            `stroke="#d1d5db" stroke-dasharray="4 4" stroke-width="1"/>`
        );
        lines.push(
            `<text x="${PAD_L - 8}" y="${gy + 4}" text-anchor="end" font-size="11" fill="#555">${fmtProb(p)}</text>`
        );
    }

    // Axes
    lines.push(
        `<line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${PAD_T + CHART_H}" stroke="#374151" stroke-width="2"/>`
    );
    lines.push(
        `<line x1="${PAD_L}" y1="${PAD_T + CHART_H}" x2="${PAD_L + CHART_W}" y2="${PAD_T + CHART_H}" stroke="#374151" stroke-width="2"/>`
    );

    // X-axis labels
    for (let t = 0; t < numObs; t++) {
        const cx    = xOf(t);
        const label = `T${t} (${obsLabels[observations[t]]})`;
        lines.push(
            `<text x="${cx}" y="${PAD_T + CHART_H + 20}" text-anchor="middle" font-size="12" fill="#374151">${label}</text>`
        );
        lines.push(
            `<line x1="${cx}" y1="${PAD_T + CHART_H}" x2="${cx}" y2="${PAD_T + CHART_H + 5}" stroke="#374151" stroke-width="1.5"/>`
        );
    }

    lines.push(
        `<text x="${PAD_L + CHART_W / 2}" y="${H - 10}" text-anchor="middle" font-size="13" fill="#374151">` +
        `Time Step (Observation)</text>`
    );
    lines.push(
        `<text x="15" y="${PAD_T + CHART_H / 2}" text-anchor="middle" font-size="13" fill="#374151" ` +
        `transform="rotate(-90, 15, ${PAD_T + CHART_H / 2})">Probability</text>`
    );

    // Data lines + circles
    for (let si = 0; si < numStates; si++) {
        const color  = COLORS[si % COLORS.length];
        const probs  = viterbiMatrix[si];
        const points = probs.map((p, t) => `${xOf(t).toFixed(2)},${yOf(p).toFixed(2)}`).join(' ');

        lines.push(
            `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`
        );

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
    const LEG_X     = PAD_L + CHART_W - 10;
    const LEG_Y     = PAD_T + 10;
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

    const resultsDir     = path.join(__dirname, '..', 'results');
    fs.mkdirSync(resultsDir, { recursive: true });
    const outputFilename = path.join(resultsDir, 'hmm_viterbi_probability_chart.svg');
    fs.writeFileSync(outputFilename, lines.join('\n'), 'utf8');
    console.log(`\nProbability chart saved to: results/hmm_viterbi_probability_chart.svg`);
    console.log(`Open that file in any web browser to view the chart.`);
}

// --- Main ---

function main() {
    const hiddenStates     = ['Sunny', 'Rainy'];
    const observableEvents = ['Walk', 'Shop', 'Clean'];

    const startProbabilities = [0.6, 0.4];

    // Rows: from-state, Cols: to-state
    const transitionMatrix = [
        [0.7, 0.3],
        [0.4, 0.6],
    ];

    // Rows: state, Cols: observation
    const emissionMatrix = [
        [0.6, 0.3, 0.1],
        [0.1, 0.4, 0.5],
    ];

    // Walk(0), Walk(0), Shop(1), Clean(2)
    const obsSequence = [0, 0, 1, 2];

    const { optimalPath: predictedStates, viterbiMatrix: probMatrix } = viterbi(
        obsSequence,
        hiddenStates,
        startProbabilities,
        transitionMatrix,
        emissionMatrix
    );

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

    visualizeProbabilities(probMatrix, hiddenStates, obsSequence, observableEvents);
}

main();
