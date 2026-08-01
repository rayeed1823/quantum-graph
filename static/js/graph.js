const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');

let scale = 40;
let offsetX = window.innerWidth / 2;
let offsetY = window.innerHeight / 2;
let isDragging = false;
let startX, startY;
let currentRawExpr = "2*x - 5";
let mathField = null;

// Initialize MathQuill safely
$(document).ready(function() {
    try {
        const MQ = MathQuill.getInterface(2);
        const mathFieldSpan = document.getElementById('math-field');

        mathField = MQ.MathField(mathFieldSpan, {
            spaceBehavesLikeTab: true,
            handlers: {
                edit: function() {
                    let latex = mathField.latex();
                    currentRawExpr = latexToMathJS(latex);
                    draw();
                }
            }
        });

        mathField.latex('2x - 5');
    } catch (e) {
        console.error("MathQuill load error:", e);
    }

    resizeCanvas();
    setupKeypad();
});

// Convert LaTeX math notation to MathJS executable syntax
function latexToMathJS(latex) {
    if (!latex) return "";
    let expr = latex;

    // 1. Convert LaTeX left/right sizing decorators (\left( -> (, \right) -> ))
    expr = expr.replace(/\\left\(/g, '(');
    expr = expr.replace(/\\right\)/g, ')');
    expr = expr.replace(/\\left|\\right/g, '');

    // 2. Convert standard fractions: \frac{a}{b} -> ((a)/(b))
    expr = expr.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))');

    // 3. Convert powers: x^{2} or x^2 -> x^(2)
    expr = expr.replace(/\^{([^}]+)}/g, '^($1)');

    // 4. Convert square roots: \sqrt{x} -> sqrt(x)
    expr = expr.replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)');

    // 5. Convert trig and log functions
    expr = expr.replace(/\\sin/g, 'sin');
    expr = expr.replace(/\\cos/g, 'cos');
    expr = expr.replace(/\\tan/g, 'tan');
    expr = expr.replace(/\\ln/g, 'log');
    expr = expr.replace(/\\log/g, 'log10');

    // 6. Convert constants
    expr = expr.replace(/\\pi/g, 'PI');

    // 7. Insert explicit multiplication for implicit terms:
    // e.g., 2x -> 2*x, 2(x) -> 2*(x), x(x) -> x*(x)
    expr = expr.replace(/(\d)([a-zA-Z\(])/g, '$1*$2');
    expr = expr.replace(/(\))([a-zA-Z0-9\(])/g, '$1*$2');

    return expr;
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
}
window.addEventListener('resize', resizeCanvas);

function draw() {
    ctx.fillStyle = '#050b14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();
    drawAxes();
    plotEquation();
}

function drawGrid() {
    ctx.lineWidth = 1;
    let gridSpacing = scale;
    while (gridSpacing < 30) gridSpacing *= 2;
    while (gridSpacing > 100) gridSpacing /= 2;

    const startGridX = Math.floor(-offsetX / gridSpacing) * gridSpacing + offsetX;
    const startGridY = Math.floor(-offsetY / gridSpacing) * gridSpacing + offsetY;

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.beginPath();
    for (let x = startGridX; x < canvas.width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for (let y = startGridY; y < canvas.height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.font = '11px monospace';

    for (let x = startGridX; x < canvas.width; x += gridSpacing) {
        let mathX = Math.round((x - offsetX) / scale);
        if (mathX !== 0) ctx.fillText(mathX, x - 5, Math.min(Math.max(offsetY + 15, 20), canvas.height - 10));
    }
    for (let y = startGridY; y < canvas.height; y += gridSpacing) {
        let mathY = Math.round((offsetY - y) / scale);
        if (mathY !== 0) ctx.fillText(mathY, Math.min(Math.max(offsetX + 8, 10), canvas.width - 25), y + 3);
    }
}

function drawAxes() {
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00f0ff';

    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);
    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);
    ctx.stroke();

    ctx.shadowBlur = 0;
}

function plotEquation() {
    if (!currentRawExpr) return;

    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff007f';

    ctx.beginPath();
    let isFirstPoint = true;

    for (let pixelX = 0; pixelX < canvas.width; pixelX += 2) {
        let mathX = (pixelX - offsetX) / scale;

        try {
            let mathY = math.evaluate(currentRawExpr, { x: mathX, e: Math.E });

            // Check for valid numbers (skips NaN or Infinity from asymptotes like tan(x))
            if (typeof mathY === 'number' && !isNaN(mathY) && isFinite(mathY)) {
                let pixelY = offsetY - (mathY * scale);

                if (isFirstPoint) {
                    ctx.moveTo(pixelX, pixelY);
                    isFirstPoint = false;
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            } else {
                isFirstPoint = true; // Break line path on invalid values
            }
        } catch (err) {
            // Silently catch incomplete expressions
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// Canvas interactions
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
});

window.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX = e.clientX - startX;
        offsetY = e.clientY - startY;
        draw();
    }
});

window.addEventListener('mouseup', () => isDragging = false);

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) scale *= zoomFactor;
    else scale /= zoomFactor;
    draw();
});

// UI Event Listeners
const sidebar = document.getElementById('sidebar');
document.getElementById('menu-toggle').addEventListener('click', () => sidebar.classList.add('open'));
document.getElementById('close-menu').addEventListener('click', () => sidebar.classList.remove('open'));

const dockBody = document.getElementById('dock-body');
const minBtn = document.getElementById('minimize-btn');
minBtn.addEventListener('click', () => {
    dockBody.classList.toggle('minimized');
    minBtn.innerHTML = dockBody.classList.contains('minimized') ? '&#43;' : '&#8722;';
});

// Keypad Event Setup
function setupKeypad() {
    const keypadToggleBtn = document.getElementById('keypad-toggle-btn');
    const virtualKeypad = document.getElementById('virtual-keypad');

    if (keypadToggleBtn && virtualKeypad) {
        keypadToggleBtn.addEventListener('click', () => {
            virtualKeypad.classList.toggle('hidden');
            if (!virtualKeypad.classList.contains('hidden') && dockBody.classList.contains('minimized')) {
                dockBody.classList.remove('minimized');
                minBtn.innerHTML = '&#8722;';
            }
        });
    }

    document.querySelectorAll('.key-btn').forEach(button => {
        // Prevent button click from stealing focus away from MathQuill field
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });

        button.addEventListener('click', (e) => {
            if (!mathField) return;

            const target = e.currentTarget;
            const cmd = target.getAttribute('data-cmd');
            const write = target.getAttribute('data-write');
            const action = target.getAttribute('data-action');

            mathField.focus();

            if (cmd) {
                mathField.cmd(cmd);
            } else if (write) {
                mathField.write(write);
            } else if (action) {
                if (action === 'clear') {
                    mathField.latex('');
                } else if (action === 'backspace') {
                    mathField.keystroke('Backspace');
                } else if (action === 'draw') {
                    draw();
                }
            }
        });
    });
}

document.querySelectorAll('.preset-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        let latex = e.target.getAttribute('data-latex');
        if (mathField) {
            mathField.latex(latex);
            currentRawExpr = latexToMathJS(latex);
            draw();
        } else {
            currentRawExpr = latexToMathJS(latex);
            draw();
        }
        sidebar.classList.remove('open');
    });
});

resizeCanvas();