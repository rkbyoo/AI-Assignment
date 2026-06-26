/**
 * Run commands:
 *   1. node code/alphaBetaPruning.js   ← this file
 *   2. node code/hmmViterbi.js
 *   3. node code/ticTacToe.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// --- Tree Node ---

class VisualTreeNode {
    constructor(name, value = null, isMax = true) {
        this.name       = name;
        this.value      = value;
        this.isMax      = isMax;
        this.children   = [];
        this.visited    = false;
        this.finalAlpha = -Infinity;
        this.finalBeta  =  Infinity;
    }

    addChild(childNode) {
        this.children.push(childNode);
    }
}

// --- Alpha-Beta Algorithm ---

function alphaBetaVisual(node, alpha, beta, isMaximizing, prunedEdges) {
    node.visited = true;

    if (node.children.length === 0) {
        node.finalAlpha = alpha;
        node.finalBeta  = beta;
        return node.value;
    }

    if (isMaximizing) {
        let bestVal = -Infinity;
        for (let i = 0; i < node.children.length; i++) {
            const value = alphaBetaVisual(node.children[i], alpha, beta, false, prunedEdges);
            bestVal = Math.max(bestVal, value);
            alpha   = Math.max(alpha, bestVal);

            if (beta <= alpha) {
                for (let j = i + 1; j < node.children.length; j++) {
                    prunedEdges.push([node.name, node.children[j].name]);
                }
                break;
            }
        }
        node.value      = bestVal;
        node.finalAlpha = alpha;
        node.finalBeta  = beta;
        return bestVal;

    } else {
        let bestVal = Infinity;
        for (let i = 0; i < node.children.length; i++) {
            const value = alphaBetaVisual(node.children[i], alpha, beta, true, prunedEdges);
            bestVal = Math.min(bestVal, value);
            beta    = Math.min(beta, bestVal);

            if (beta <= alpha) {
                for (let j = i + 1; j < node.children.length; j++) {
                    prunedEdges.push([node.name, node.children[j].name]);
                }
                break;
            }
        }
        node.value      = bestVal;
        node.finalAlpha = alpha;
        node.finalBeta  = beta;
        return bestVal;
    }
}

// --- SVG Renderer ---

function assignPositions(root) {
    const LEAF_SPACING = 110;
    const START_X      = 80;
    const positions    = new Map();

    ['L1','L2','L3','L4','L5','L6','L7','L8'].forEach((name, i) => {
        positions.set(name, { x: START_X + i * LEAF_SPACING, y: 490 });
    });

    const lvl2 = [
        { name:'C1', leaves:['L1','L2'] },
        { name:'C2', leaves:['L3','L4'] },
        { name:'C3', leaves:['L5','L6'] },
        { name:'C4', leaves:['L7','L8'] },
    ];
    for (const { name, leaves } of lvl2) {
        const x = (positions.get(leaves[0]).x + positions.get(leaves[1]).x) / 2;
        positions.set(name, { x, y: 360 });
    }

    const lvl1 = [
        { name:'B1', children:['C1','C2'] },
        { name:'B2', children:['C3','C4'] },
    ];
    for (const { name, children } of lvl1) {
        const x = (positions.get(children[0]).x + positions.get(children[1]).x) / 2;
        positions.set(name, { x, y: 230 });
    }

    const rootX = (positions.get('B1').x + positions.get('B2').x) / 2;
    positions.set('Root', { x: rootX, y: 100 });

    const queue = [root];
    while (queue.length) {
        const n = queue.shift();
        if (positions.has(n.name)) positions.get(n.name).node = n;
        for (const c of n.children) queue.push(c);
    }
    return positions;
}

function esc(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderSVG(root, prunedEdges, outputFile) {
    const W = 960;
    const H = 620;

    const pos       = assignPositions(root);
    const prunedSet = new Set(prunedEdges.map(([p, c]) => `${p}→${c}`));
    const isPruned  = (p, c) => prunedSet.has(`${p}→${c}`);
    const lines     = [];

    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Arial, sans-serif">`);
    lines.push(`<rect width="${W}" height="${H}" fill="#f8fafc"/>`);
    lines.push(
        `<text x="${W/2}" y="34" text-anchor="middle" font-size="16" font-weight="bold" fill="#1e293b">` +
        `Alpha-Beta Pruning Game Tree</text>`
    );

    // Legend
    const LX = W - 220, LY = 55;
    lines.push(`<rect x="${LX}" y="${LY}" width="200" height="80" rx="6" fill="#fff" stroke="#cbd5e1" stroke-width="1"/>`);
    lines.push(`<line x1="${LX+14}" y1="${LY+20}" x2="${LX+50}" y2="${LY+20}" stroke="#1d4ed8" stroke-width="2"/>`);
    lines.push(`<text x="${LX+58}" y="${LY+24}" font-size="12" fill="#334155">Normal edge</text>`);
    lines.push(`<line x1="${LX+14}" y1="${LY+45}" x2="${LX+50}" y2="${LY+45}" stroke="#9ca3af" stroke-width="2" stroke-dasharray="5 4"/>`);
    lines.push(`<text x="${LX+58}" y="${LY+49}" font-size="12" fill="#334155">Pruned edge</text>`);
    lines.push(`<polygon points="${LX+14},${LY+72} ${LX+22},${LY+58} ${LX+30},${LY+72}" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/>`);
    lines.push(`<text x="${LX+38}" y="${LY+72}" font-size="12" fill="#334155">MAX node</text>`);

    // Collect edges
    const allEdges = [];
    const collect  = node => {
        for (const child of node.children) {
            allEdges.push([node.name, child.name]);
            collect(child);
        }
    };
    collect(root);

    // Draw edges
    for (const [pName, cName] of allEdges) {
        const p      = pos.get(pName);
        const c      = pos.get(cName);
        const pruned = isPruned(pName, cName);

        if (pruned) {
            lines.push(
                `<line x1="${p.x}" y1="${p.y+28}" x2="${c.x}" y2="${c.y-16}" ` +
                `stroke="#9ca3af" stroke-width="1.8" stroke-dasharray="6 4"/>`
            );
            const mx = (p.x + c.x) / 2;
            const my = (p.y + 28 + c.y - 16) / 2;
            lines.push(`<rect x="${mx-24}" y="${my-9}" width="48" height="16" rx="3" fill="#fef9c3"/>`);
            lines.push(
                `<text x="${mx}" y="${my+3}" text-anchor="middle" font-size="9" font-weight="bold" fill="#b45309">PRUNED</text>`
            );
        } else {
            lines.push(
                `<line x1="${p.x}" y1="${p.y+28}" x2="${c.x}" y2="${c.y-16}" ` +
                `stroke="#1d4ed8" stroke-width="2"/>`
            );
        }
    }

    // Draw nodes
    for (const [name, { node, x, y }] of pos) {
        if (!node) continue;

        const isLeaf = node.children.length === 0;

        if (isLeaf) {
            const boxW = 70, boxH = 32;
            lines.push(
                `<rect x="${x - boxW/2}" y="${y - boxH/2}" width="${boxW}" height="${boxH}" ` +
                `rx="5" fill="${node.visited ? '#dcfce7' : '#f1f5f9'}" stroke="${node.visited ? '#16a34a' : '#94a3b8'}" stroke-width="1.5"/>`
            );
            lines.push(
                `<text x="${x}" y="${y-2}" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e293b">${esc(name)}</text>`
            );
            lines.push(
                `<text x="${x}" y="${y+11}" text-anchor="middle" font-size="9" fill="${node.visited ? '#15803d' : '#64748b'}">` +
                `Val: ${node.value !== null ? node.value : '—'}</text>`
            );
        } else {
            const SIZE    = 30;
            const typeStr = node.isMax ? 'MAX' : 'MIN';
            const valStr  = node.value !== null ? node.value : '?';
            const aStr    = node.finalAlpha === -Infinity ? '-∞' : node.finalAlpha;
            const bStr    = node.finalBeta  ===  Infinity ? '∞'  : node.finalBeta;
            const fillClr = node.isMax ? '#dbeafe' : '#fce7f3';
            const strkClr = node.isMax ? '#1d4ed8' : '#db2777';

            let pts;
            if (node.isMax) {
                pts = `${x},${y-SIZE}  ${x-SIZE},${y+SIZE*0.6}  ${x+SIZE},${y+SIZE*0.6}`;
            } else {
                pts = `${x},${y+SIZE}  ${x-SIZE},${y-SIZE*0.6}  ${x+SIZE},${y-SIZE*0.6}`;
            }

            lines.push(`<polygon points="${pts}" fill="${fillClr}" stroke="${strkClr}" stroke-width="2"/>`);
            lines.push(`<text text-anchor="middle" font-size="10" fill="#1e293b">`);
            lines.push(`  <tspan x="${x}" dy="0" y="${y-8}" font-weight="bold">${esc(name)} (${typeStr})</tspan>`);
            lines.push(`  <tspan x="${x}" dy="13">Val: ${esc(String(valStr))}</tspan>`);
            lines.push(`  <tspan x="${x}" dy="12">α:${esc(String(aStr))} β:${esc(String(bStr))}</tspan>`);
            lines.push(`</text>`);
        }
    }

    lines.push('</svg>');
    fs.writeFileSync(outputFile, lines.join('\n'), 'utf8');
}

// --- Main ---

function main() {
    const root = new VisualTreeNode('Root', null, true);

    const b1 = new VisualTreeNode('B1', null, false);
    const b2 = new VisualTreeNode('B2', null, false);
    root.addChild(b1);
    root.addChild(b2);

    const c1 = new VisualTreeNode('C1', null, true);
    const c2 = new VisualTreeNode('C2', null, true);
    const c3 = new VisualTreeNode('C3', null, true);
    const c4 = new VisualTreeNode('C4', null, true);
    b1.addChild(c1);
    b1.addChild(c2);
    b2.addChild(c3);
    b2.addChild(c4);

    c1.addChild(new VisualTreeNode('L1', 3));
    c1.addChild(new VisualTreeNode('L2', 5));
    c2.addChild(new VisualTreeNode('L3', 6));
    c2.addChild(new VisualTreeNode('L4', 9));
    c3.addChild(new VisualTreeNode('L5', 1));
    c3.addChild(new VisualTreeNode('L6', 2));
    c4.addChild(new VisualTreeNode('L7', 0));
    c4.addChild(new VisualTreeNode('L8', -2));

    const prunedList = [];

    console.log('Executing Alpha-Beta Search...');
    const optimalValue = alphaBetaVisual(root, -Infinity, Infinity, true, prunedList);
    console.log(`Alpha-Beta execution completed. Optimal value: ${optimalValue}`);
    console.log(`Pruned structural connections detected: ${JSON.stringify(prunedList)}`);

    const resultsDir = path.join(__dirname, '..', 'results');
    fs.mkdirSync(resultsDir, { recursive: true });

    const outputFile = path.join(resultsDir, 'alpha_beta_game_tree.svg');
    renderSVG(root, prunedList, outputFile);
    console.log(`\nTree visual saved to: results/alpha_beta_game_tree.svg`);
    console.log(`Open that file in any web browser to view the annotated game tree.`);
}

main();
