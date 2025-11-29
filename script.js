/**
 * DFA Visualization Engine
 * Core Logic & Rendering
 */

// --- Base Automaton Class ---
class Automaton {
    constructor(name) {
        this.name = name;
        this.states = []; // Array of state objects { id, x, y, isFinal, label }
        this.transitions = []; // Array of { from, to, symbol }
        this.currentState = null;
        this.history = []; // Log of steps
    }

    reset() {
        this.currentState = this.states.find(s => s.isStart);
        this.history = [];
        this.log(`Reinicio al estado inicial: ${this.currentState.label}`);
    }

    step(symbol) {
        if (!this.currentState) return { error: "No hay estado actual" };

        const transition = this.transitions.find(t =>
            t.from === this.currentState.id && this.matchesSymbol(t.symbol, symbol)
        );

        if (transition) {
            const previousState = this.currentState;
            this.currentState = this.states.find(s => s.id === transition.to);
            const stepInfo = {
                from: previousState.label,
                to: this.currentState.label,
                symbol: symbol,
                valid: true
            };
            this.history.push(stepInfo);
            this.log(`Transición: ${previousState.label} --(${symbol})--> ${this.currentState.label}`);
            return stepInfo;
        } else {
            // Analyze what was expected
            const possibleTransitions = this.transitions.filter(t => t.from === this.currentState.id);
            const expected = possibleTransitions.map(t => t.symbol).join(" o ");

            let reason = "";
            if (possibleTransitions.length === 0) {
                reason = "No hay más transiciones posibles desde este estado (Callejón sin salida).";
            } else {
                reason = `Se esperaba: [${expected}], pero se encontró: '${symbol}'.`;
            }

            const error = `Error en ${this.currentState.label}: ${reason}`;
            this.log(error, 'error');
            return { error: error, valid: false, reason: reason };
        }
    }

    matchesSymbol(rule, symbol) {
        if (rule === symbol) return true;
        // Special categories
        if (rule === 'DIGIT' && /[0-9]/.test(symbol)) return true;
        if (rule === 'ALPHA' && /[a-zA-Z]/.test(symbol)) return true;
        if (rule === 'ALPHANUM' && /[a-zA-Z0-9]/.test(symbol)) return true;
        return false;
    }

    log(message, type = 'info') {
        const event = new CustomEvent('automaton-log', { detail: { message, type } });
        document.dispatchEvent(event);
    }

    getGrammar() {
        return "S -> ..."; // To be overridden
    }
}

// --- Email Automaton ---
class EmailAutomaton extends Automaton {
    constructor() {
        super("Email Validator");
        this.setupGraph();
    }

    setupGraph() {
        // States
        // q0: Start, expecting start of local-part
        // q1: Inside local-part
        // q2: Read '@', expecting start of domain
        // q3: Inside domain part
        // q4: Read '.', expecting domain extension
        // q5: Inside domain extension (Final)

        this.states = [
            { id: 'q0', label: 'q0', x: 100, y: 300, isStart: true, isFinal: false },
            { id: 'q1', label: 'q1', x: 250, y: 300, isStart: false, isFinal: false },
            { id: 'q2', label: 'q2', x: 400, y: 300, isStart: false, isFinal: false },
            { id: 'q3', label: 'q3', x: 550, y: 300, isStart: false, isFinal: false },
            { id: 'q4', label: 'q4', x: 700, y: 300, isStart: false, isFinal: false },
            { id: 'q5', label: 'q5', x: 850, y: 300, isStart: false, isFinal: true }
        ];

        this.transitions = [
            // q0 -> q1 (Start local-part: alpha or digit, no dot/hyphen)
            { from: 'q0', to: 'q1', symbol: 'ALPHANUM' },

            // q1 -> q1 (Continue local-part: alpha, digit, dot, hyphen, underscore)
            // Note: Simplification for "no end with dot" check is tricky in pure DFA without lookahead or more states.
            // We will use a simplified DFA that allows dot/hyphen in middle but we might need more states to strictly enforce "not at end".
            // Strict "no dot at end of local-part" before @ requires splitting q1.
            // Let's refine:
            // q1: Just read alphanum (valid ending for local-part)
            // q1_sep: Just read dot/hyphen/underscore (invalid ending)

            // Revised States for stricter compliance:
            // q0: Start
            // q1: Valid local-part end (read alphanum)
            // q1_sep: Read separator (., -, _), must be followed by alphanum
            // q2: Read @
            // q3: Valid domain part end (read alphanum)
            // q3_sep: Read separator (., -), must be followed by alphanum
            // q4: Read DOT (special separator for extension)
            // q5: Valid extension (read alphanum)
        ];

        // Re-defining states for strictness - SCALED UP
        this.states = [
            { id: 'q0', label: 'Start', x: 100, y: 400, isStart: true, isFinal: false },
            { id: 'q1', label: 'Local', x: 300, y: 400, isStart: false, isFinal: false },
            { id: 'q1s', label: 'Sep', x: 300, y: 200, isStart: false, isFinal: false },
            { id: 'q2', label: '@', x: 500, y: 400, isStart: false, isFinal: false },
            { id: 'q3', label: 'Dom', x: 700, y: 400, isStart: false, isFinal: false },
            { id: 'q3s', label: 'Sep', x: 700, y: 200, isStart: false, isFinal: false },
            { id: 'q4', label: 'Dot', x: 900, y: 400, isStart: false, isFinal: false },
            { id: 'q5', label: 'Ext', x: 1100, y: 400, isStart: false, isFinal: true }
        ];

        this.transitions = [
            // q0 -> q1 (Start local)
            { from: 'q0', to: 'q1', symbol: 'ALPHANUM' },

            // q1 -> q1 (More alphanum)
            { from: 'q1', to: 'q1', symbol: 'ALPHANUM' },
            // q1 -> q1s (Separator)
            { from: 'q1', to: 'q1s', symbol: '.' },
            { from: 'q1', to: 'q1s', symbol: '-' },
            { from: 'q1', to: 'q1s', symbol: '_' },

            // q1s -> q1 (Back to valid)
            { from: 'q1s', to: 'q1', symbol: 'ALPHANUM' },

            // q1 -> q2 (At) - Only from valid local end
            { from: 'q1', to: 'q2', symbol: '@' },

            // q2 -> q3 (Start domain)
            { from: 'q2', to: 'q3', symbol: 'ALPHANUM' },

            // q3 -> q3 (More alphanum)
            { from: 'q3', to: 'q3', symbol: 'ALPHANUM' },
            // q3 -> q3s (Separator: hyphen) - Dot is special
            { from: 'q3', to: 'q3s', symbol: '-' },

            // q3s -> q3 (Back to valid)
            { from: 'q3s', to: 'q3', symbol: 'ALPHANUM' },

            // q3 -> q4 (The Dot)
            { from: 'q3', to: 'q4', symbol: '.' },

            // q4 -> q5 (Start Extension)
            { from: 'q4', to: 'q5', symbol: 'ALPHANUM' },

            // q5 -> q5 (More extension)
            { from: 'q5', to: 'q5', symbol: 'ALPHANUM' },
            // q5 -> q4 (Another dot? e.g. .co.uk)
            { from: 'q5', to: 'q4', symbol: '.' }
        ];

        this.reset();
    }

    matchesSymbol(rule, symbol) {
        // Override for specific chars
        if (['.', '-', '_', '@'].includes(symbol)) {
            return rule === symbol;
        }
        return super.matchesSymbol(rule, symbol);
    }

    getGrammar() {
        return `
S -> [a-z0-9] A
A -> [a-z0-9] A | [._-] B | @ C
B -> [a-z0-9] A
C -> [a-z0-9] D
D -> [a-z0-9] D | - E | . F
E -> [a-z0-9] D
F -> [a-z0-9] G
G -> [a-z0-9] G | . F | ε
        `.trim();
    }

    getConclusion(input, valid, finalState) {
        if (valid && finalState.isFinal) {
            return "Es un email válido. Cumple con el formato local@dominio.ext";
        }

        // Analyze specific failure cases
        if (!valid) {
            // It failed during a transition
            // We need to find *where* it failed. Let's re-simulate quickly or use the last state from the main loop
            // But here we just get the result. 
            // Actually, to give a good reason, we need the context of the failure.
            // Let's look at the last char and state.

            // Heuristic analysis based on input pattern
            if (/^[^a-zA-Z0-9]/.test(input)) return "No se acepta porque un email debe comenzar con una letra o número.";
            if (input.includes(', ')) return "No se acepta porque contiene una coma (',') que no es válida en emails.";
            if ((input.match(/@/g) || []).length > 1) return "No se acepta porque contiene más de un símbolo '@'.";
            if (/[^a-zA-Z0-9.\-_@]/.test(input)) {
                const badChar = input.match(/[^a-zA-Z0-9.\-_@]/)[0];
                return `No se acepta porque el carácter '${badChar}' no está permitido.`;
            }
            if (input.includes('..')) return "No se acepta porque hay dos puntos consecutivos ('..').";

            return "No se acepta porque contiene caracteres inválidos o una estructura incorrecta.";
        } else {
            // Valid transitions but stopped in non-final
            if (finalState.id === 'q0') return "No se acepta porque está vacío.";
            if (finalState.id === 'q1' || finalState.id === 'q1s') return "No se acepta porque falta el símbolo '@' y el dominio.";
            if (finalState.id === 'q2') return "No se acepta porque falta el dominio después del '@'.";
            if (finalState.id === 'q3' || finalState.id === 'q3s') return "No se acepta porque falta la extensión del dominio (ej. .com).";
            if (finalState.id === 'q4') return "No se acepta porque el dominio no puede terminar en un punto.";

            return `No se acepta porque está incompleto (terminó en estado ${finalState.label}).`;
        }
    }
}

// --- Modulo 3 Automaton ---
class Modulo3Automaton extends Automaton {
    constructor() {
        super("Modulo 3 Calculator");
        this.setupGraph();
    }

    setupGraph() {
        // States: q0 (rem 0), q1 (rem 1), q2 (rem 2) - SCALED UP
        this.states = [
            { id: 'q0', label: 'Rem 0', x: 600, y: 150, isStart: true, isFinal: true },
            { id: 'q1', label: 'Rem 1', x: 900, y: 600, isStart: false, isFinal: false },
            { id: 'q2', label: 'Rem 2', x: 300, y: 600, isStart: false, isFinal: false }
        ];

        // Transitions logic: new_rem = (old_rem * 10 + digit) % 3
        // 10 % 3 = 1. So new_rem = (old_rem * 1 + digit) % 3 = (old_rem + digit) % 3

        // From q0 (0):
        // 1 -> (0+1)%3 = 1 (q1)
        // 2 -> (0+2)%3 = 2 (q2)
        // 3 -> (0+3)%3 = 0 (q0)

        // From q1 (1):
        // 1 -> (1+1)%3 = 2 (q2)
        // 2 -> (1+2)%3 = 0 (q0)
        // 3 -> (1+3)%3 = 1 (q1)

        // From q2 (2):
        // 1 -> (2+1)%3 = 0 (q0)
        // 2 -> (2+2)%3 = 1 (q1)
        // 3 -> (2+3)%3 = 2 (q2)

        this.transitions = [
            { from: 'q0', to: 'q1', symbol: '1' },
            { from: 'q0', to: 'q2', symbol: '2' },
            { from: 'q0', to: 'q0', symbol: '3' },

            { from: 'q1', to: 'q2', symbol: '1' },
            { from: 'q1', to: 'q0', symbol: '2' },
            { from: 'q1', to: 'q1', symbol: '3' },

            { from: 'q2', to: 'q0', symbol: '1' },
            { from: 'q2', to: 'q1', symbol: '2' },
            { from: 'q2', to: 'q2', symbol: '3' }
        ];

        this.reset();
    }

    getGrammar() {
        return `
S -> 1 A | 2 B | 3 S | ε
A -> 1 B | 2 S | 3 A
B -> 1 S | 2 A | 3 B
(Where S=q0, A=q1, B=q2)
        `.trim();
    }

    getConclusion(input, valid, finalState) {
        // Calculate sum of digits
        let sum = 0;
        for (let char of input) {
            if (/[0-9]/.test(char)) sum += parseInt(char);
        }

        if (!valid) {
            return "No se acepta porque contiene caracteres que no son dígitos.";
        }

        if (finalState.isFinal) {
            return `Es aceptada porque la suma de sus dígitos es ${sum}, que es múltiplo de 3.`;
        } else {
            const remainder = sum % 3;
            return `No es aceptada porque la suma de sus dígitos es ${sum} (residuo ${remainder}), y para ser múltiplo de 3 el residuo debe ser 0.`;
        }
    }
}

// --- Renderer Class ---
class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.automaton = null;
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.pulseFrame = 0;
        this.animating = false;
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
        if (this.automaton) this.draw();
    }

    setAutomaton(automaton) {
        this.automaton = automaton;
        // Recalculate positions based on canvas size if needed, or just scale
        // For now, we'll use fixed relative coordinates or simple scaling
        this.draw();
    }

    draw() {
        if (!this.automaton) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Auto-center graph
        const padding = 50;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        this.automaton.states.forEach(s => {
            if (s.x < minX) minX = s.x;
            if (s.x > maxX) maxX = s.x;
            if (s.y < minY) minY = s.y;
            if (s.y > maxY) maxY = s.y;
        });

        const graphWidth = maxX - minX;
        const graphHeight = maxY - minY;
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const canvasCenterX = this.canvas.width / 2;
        const canvasCenterY = this.canvas.height / 2;

        const offsetX = canvasCenterX - centerX;
        const offsetY = canvasCenterY - centerY;

        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);

        // Draw Transitions (Edges)
        this.automaton.transitions.forEach(t => {
            const fromState = this.automaton.states.find(s => s.id === t.from);
            const toState = this.automaton.states.find(s => s.id === t.to);
            this.drawEdge(fromState, toState, t.symbol);
        });

        // Draw States (Nodes)
        this.automaton.states.forEach(state => {
            this.drawNode(state);
        });

        // Draw Active State Pulse
        if (this.automaton.currentState) {
            this.drawPulse(this.automaton.currentState);
        }

        if (this.animating) {
            this.pulseFrame++;
            requestAnimationFrame(() => this.draw());
        }

        this.ctx.restore();
    }

    drawNode(state) {
        const ctx = this.ctx;
        const isActive = this.automaton.currentState && this.automaton.currentState.id === state.id;
        const radius = 50; // Increased from 30

        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? 'rgba(0, 243, 255, 0.2)' : 'rgba(20, 30, 50, 0.8)';
        ctx.fill();
        ctx.lineWidth = isActive ? 4 : 3; // Thicker lines
        ctx.strokeStyle = isActive ? '#00f3ff' : '#94a3b8';
        if (state.isFinal) {
            ctx.strokeStyle = isActive ? '#00ff9d' : '#00ff9d'; // Green for final
            ctx.lineWidth = 5;
            // Double circle for final
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(state.x, state.y, radius - 8, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.stroke();
        }

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px Fira Code'; // Larger font
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(state.label, state.x, state.y);

        // Start arrow
        if (state.isStart) {
            ctx.beginPath();
            ctx.moveTo(state.x - 80, state.y); // Adjusted for larger radius
            ctx.lineTo(state.x - (radius + 10), state.y);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 3;
            ctx.stroke();
            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(state.x - (radius + 10), state.y);
            ctx.lineTo(state.x - (radius + 20), state.y - 8);
            ctx.lineTo(state.x - (radius + 20), state.y + 8);
            ctx.fill();
        }
    }

    drawEdge(from, to, label) {
        const ctx = this.ctx;
        ctx.beginPath();

        // Calculate angle
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const angle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Self loop
        if (from.id === to.id) {
            ctx.beginPath();
            ctx.arc(from.x, from.y - 40, 20, 0, Math.PI * 2); // Circle above
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.stroke();
            // Text
            ctx.fillStyle = '#aaa';
            ctx.fillText(label, from.x, from.y - 70);
            return;
        }

        // Curve for bidirectional or just aesthetic
        // Simple straight line for now, maybe quadratic curve if multiple edges
        ctx.moveTo(from.x + Math.cos(angle) * 30, from.y + Math.sin(angle) * 30);
        ctx.lineTo(to.x - Math.cos(angle) * 30, to.y - Math.sin(angle) * 30);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Arrowhead
        const endX = to.x - Math.cos(angle) * 30;
        const endY = to.y - Math.sin(angle) * 30;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();

        // Label
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = '#aaa';
        ctx.fillText(label, midX, midY - 10);
    }

    drawPulse(state) {
        const ctx = this.ctx;
        const radius = 50 + Math.sin(this.pulseFrame * 0.1) * 8; // Adjusted for base radius 50
        ctx.beginPath();
        ctx.arc(state.x, state.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 243, 255, ${0.5 - Math.sin(this.pulseFrame * 0.1) * 0.2})`;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    startAnimation() {
        this.animating = true;
        this.draw();
    }

    stopAnimation() {
        this.animating = false;
    }
}

// --- Main App Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new Renderer('dfa-canvas');
    let currentAutomaton = new EmailAutomaton();

    // UI Elements
    const grammarContent = document.getElementById('grammar-content');
    const logContent = document.getElementById('log-content');
    const inputString = document.getElementById('input-string');
    const statusIndicator = document.getElementById('status-indicator');

    // Initialize
    renderer.setAutomaton(currentAutomaton);
    renderer.startAnimation();
    updateGrammar();

    // Event Listeners
    document.getElementById('nav-email').addEventListener('click', () => switchModule('email'));
    document.getElementById('nav-modulo').addEventListener('click', () => switchModule('modulo'));

    document.getElementById('btn-validate').addEventListener('click', () => validateInput());
    document.getElementById('btn-animate').addEventListener('click', () => animateInput());
    document.getElementById('btn-reset').addEventListener('click', () => reset());
    document.getElementById('clear-log').addEventListener('click', () => {
        logContent.innerHTML = '';
        log('Registro borrado.', 'system');
    });

    // Custom Log Event
    document.addEventListener('automaton-log', (e) => {
        log(e.detail.message, e.detail.type);
    });

    function switchModule(module) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.getElementById(`nav-${module}`).classList.add('active');

        if (module === 'email') {
            currentAutomaton = new EmailAutomaton();
        } else {
            currentAutomaton = new Modulo3Automaton();
        }
        renderer.setAutomaton(currentAutomaton);
        updateGrammar();
        reset();
        log(`Cambiado a ${currentAutomaton.name}`, 'system');
    }

    function updateGrammar() {
        grammarContent.innerText = currentAutomaton.getGrammar();
    }

    function log(msg, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.innerText = `> ${msg}`;
        logContent.appendChild(line);
        logContent.scrollTop = logContent.scrollHeight;
    }

    function reset() {
        currentAutomaton.reset();
        inputString.value = '';
        statusIndicator.innerText = "ESPERANDO INPUT";
        statusIndicator.style.borderColor = "#00f3ff";
        statusIndicator.style.color = "#00f3ff";
        renderer.draw();
    }

    function validateInput() {
        const input = inputString.value;
        currentAutomaton.reset();
        let valid = true;

        for (let char of input) {
            const result = currentAutomaton.step(char);
            if (!result.valid) {
                valid = false;
                break;
            }
        }

        if (valid && currentAutomaton.currentState.isFinal) {
            const msg = `Cadena "${input}" ACEPTADA.`;
            log(msg, 'success');

            const conclusion = currentAutomaton.getConclusion(input, true, currentAutomaton.currentState);
            log(`Conclusión: ${conclusion}`, 'success');

            statusIndicator.innerText = "ACEPTADA";
            statusIndicator.style.borderColor = "#00ff9d";
            statusIndicator.style.color = "#00ff9d";
        } else {
            log(`Cadena "${input}" RECHAZADA.`, 'error');

            const conclusion = currentAutomaton.getConclusion(input, valid, currentAutomaton.currentState);
            log(`Conclusión: ${conclusion}`, 'error');

            statusIndicator.innerText = "RECHAZADA";
            statusIndicator.style.borderColor = "#ff0055";
            statusIndicator.style.color = "#ff0055";
        }
        renderer.draw();
    }

    async function animateInput() {
        const input = inputString.value;
        const speed = 2100 - document.getElementById('speed-slider').value; // Invert slider

        currentAutomaton.reset();
        renderer.draw();

        for (let char of input) {
            statusIndicator.innerText = `PROCESANDO: '${char}'`;
            await new Promise(r => setTimeout(r, speed));

            const result = currentAutomaton.step(char);
            renderer.draw();

            if (!result.valid) {
                statusIndicator.innerText = "ERROR";
                statusIndicator.style.borderColor = "#ff0055";
                statusIndicator.style.color = "#ff0055";

                const conclusion = currentAutomaton.getConclusion(input, false, currentAutomaton.currentState);
                log(`Animación finalizada: ${conclusion}`, 'error');
                return;
            }
        }

        if (currentAutomaton.currentState.isFinal) {
            statusIndicator.innerText = "ACEPTADA";
            statusIndicator.style.borderColor = "#00ff9d";
            statusIndicator.style.color = "#00ff9d";

            const conclusion = currentAutomaton.getConclusion(input, true, currentAutomaton.currentState);
            log(`Animación finalizada: ${conclusion}`, 'success');
        } else {
            statusIndicator.innerText = "INCOMPLETA";
            statusIndicator.style.borderColor = "#ff0055";
            statusIndicator.style.color = "#ff0055";

            const conclusion = currentAutomaton.getConclusion(input, true, currentAutomaton.currentState);
            log(`Animación finalizada: ${conclusion}`, 'error');
        }
    }
});
