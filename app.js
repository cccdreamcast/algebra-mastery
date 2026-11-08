// Algebra Mastery - Fun & Interactive Edition
// Gamified algebra learning with XP, streaks, achievements, and visual tools

const topics = {
    linear: { name: "Linear Equations", completed: false, xp: 0 },
    systems: { name: "Systems of Equations", completed: false, xp: 0 },
    quadratic: { name: "Quadratic Equations", completed: false, xp: 0 },
    polynomials: { name: "Polynomials & Factoring", completed: false, xp: 0 },
    exponents: { name: "Exponents & Radicals", completed: false, xp: 0 },
    rational: { name: "Rational Expressions", completed: false, xp: 0 }
};

const achievements = {
    firstSolve: { name: "First Steps", desc: "Solve your first equation", icon: "🌱", unlocked: false },
    streak5: { name: "On Fire", desc: "Get a 5-answer streak", icon: "🔥", unlocked: false },
    streak10: { name: "Unstoppable", desc: "Get a 10-answer streak", icon: "⚡", unlocked: false },
    level5: { name: "Apprentice", desc: "Reach Level 5", icon: "📚", unlocked: false },
    level10: { name: "Algebra Adept", desc: "Reach Level 10", icon: "🎓", unlocked: false },
    allTopics: { name: "Master", desc: "Complete all topics", icon: "👑", unlocked: false },
    quadraticPro: { name: "Quadratic Pro", desc: "Solve 10 quadratics", icon: "📈", unlocked: false }
};

let currentSection = 'dashboard';
let currentProblem = null;
let player = {
    xp: 0,
    level: 1,
    streak: 0,
    bestStreak: 0,
    totalSolved: 0,
    quadraticSolved: 0
};

// Load / Save
function loadProgress() {
    const saved = localStorage.getItem('algebraMastery');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.topics) Object.assign(topics, data.topics);
        if (data.player) Object.assign(player, data.player);
        if (data.achievements) {
            Object.keys(achievements).forEach(k => {
                if (data.achievements[k]) achievements[k].unlocked = true;
            });
        }
    }
    updateUI();
}

function saveProgress() {
    const data = {
        topics,
        player,
        achievements: Object.fromEntries(Object.entries(achievements).map(([k,v]) => [k, v.unlocked]))
    };
    localStorage.setItem('algebraMastery', JSON.stringify(data));
    updateUI();
}

function updateUI() {
    const completed = Object.values(topics).filter(t => t.completed).length;
    const percent = Math.round((completed / Object.keys(topics).length) * 100);
    const fill = document.getElementById('progressFill');
    const text = document.getElementById('progressText');
    if (fill) fill.style.width = percent + '%';
    if (text) text.textContent = percent + '% Complete';

    const lvlEl = document.getElementById('playerLevel');
    const xpEl = document.getElementById('playerXP');
    const streakEl = document.getElementById('playerStreak');
    if (lvlEl) lvlEl.textContent = player.level;
    if (xpEl) xpEl.textContent = player.xp;
    if (streakEl) streakEl.textContent = player.streak + ' 🔥';
}

function addXP(amount, reason = '') {
    player.xp += amount;
    const newLevel = Math.floor(player.xp / 100) + 1;
    if (newLevel > player.level) {
        player.level = newLevel;
        showXPPopup(`Level Up! Level ${player.level}`);
        checkAchievements();
    } else {
        showXPPopup(`+${amount} XP`);
    }
    if (reason) console.log(reason);
    saveProgress();
}

function showXPPopup(text) {
    const popup = document.createElement('div');
    popup.className = 'xp-popup';
    popup.textContent = text;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1200);
}

function celebrate() {
    // Confetti
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 40; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.background = ['#c9895a', '#4ade80', '#f87171', '#60a5fa', '#fbbf24'][Math.floor(Math.random()*5)];
        conf.style.animationDelay = Math.random() * 0.5 + 's';
        conf.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(conf);
        setTimeout(() => conf.remove(), 3500);
    }
    // Simple beep
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
}

function checkAchievements() {
    if (player.totalSolved >= 1 && !achievements.firstSolve.unlocked) {
        achievements.firstSolve.unlocked = true;
        showXPPopup('Achievement: First Steps!');
    }
    if (player.streak >= 5 && !achievements.streak5.unlocked) {
        achievements.streak5.unlocked = true;
        showXPPopup('Achievement: On Fire!');
    }
    if (player.streak >= 10 && !achievements.streak10.unlocked) {
        achievements.streak10.unlocked = true;
        showXPPopup('Achievement: Unstoppable!');
    }
    if (player.level >= 5 && !achievements.level5.unlocked) {
        achievements.level5.unlocked = true;
        showXPPopup('Achievement: Apprentice!');
    }
    if (player.level >= 10 && !achievements.level10.unlocked) {
        achievements.level10.unlocked = true;
        showXPPopup('Achievement: Algebra Adept!');
    }
    if (player.quadraticSolved >= 10 && !achievements.quadraticPro.unlocked) {
        achievements.quadraticPro.unlocked = true;
        showXPPopup('Achievement: Quadratic Pro!');
    }
    const allDone = Object.values(topics).every(t => t.completed);
    if (allDone && !achievements.allTopics.unlocked) {
        achievements.allTopics.unlocked = true;
        showXPPopup('Achievement: Algebra Master!');
    }
    saveProgress();
}

function correctAnswer(xp = 15) {
    player.streak++;
    player.bestStreak = Math.max(player.bestStreak, player.streak);
    player.totalSolved++;
    addXP(xp + Math.min(player.streak * 2, 20));
    celebrate();
    checkAchievements();
}

function wrongAnswer() {
    player.streak = 0;
    saveProgress();
}

function renderMath(element) {
    if (window.renderMathInElement) {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ]
        });
    }
}

function showSection(section) {
    currentSection = section;
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === section);
    });
    const main = document.getElementById('mainContent');
    main.innerHTML = getSectionContent(section);
    renderMath(main);
    attachEventListeners();
}

function getSectionContent(section) {
    switch(section) {
        case 'dashboard': return getDashboard();
        case 'linear': return getLinear();
        case 'systems': return getSystems();
        case 'quadratic': return getQuadratic();
        case 'polynomials': return getPolynomials();
        case 'exponents': return getExponents();
        case 'rational': return getRational();
        case 'tools': return getTools();
        case 'achievements': return getAchievements();
        default: return getDashboard();
    }
}

function getDashboard() {
    let html = `
        <div class="section">
            <h2>Welcome, Algebra Explorer!</h2>
            <p>Earn XP, build streaks, and unlock achievements as you master algebra. Every correct answer levels you up.</p>
            <div class="card">
                <h3>Your Stats</h3>
                <p>Level <strong>${player.level}</strong> • ${player.xp} XP • Best Streak: ${player.bestStreak} 🔥 • Problems Solved: ${player.totalSolved}</p>
            </div>
            <div class="topic-grid">
    `;
    Object.entries(topics).forEach(([key, topic]) => {
        html += `
            <div class="topic-card" data-topic="${key}">
                <h3>${topic.name}</h3>
                <p>Practice & earn XP</p>
                ${topic.completed ? '<span class="completed-badge">Completed</span>' : '<span style="color:var(--muted);font-size:0.85rem;">In Progress</span>'}
            </div>
        `;
    });
    html += `
            </div>
            <div class="card">
                <h3>Quick Start</h3>
                <p>Jump into practice or use the visual tools.</p>
                <button onclick="showSection('linear')">Start with Linear</button>
                <button class="secondary" onclick="showSection('tools')">Open Tools</button>
            </div>
        </div>
    `;
    return html;
}

function getLinear() {
    return `
        <div class="section">
            <h2>⚖️ Linear Equations</h2>
            <div class="card">
                <h3>Balance the Equation</h3>
                <p>Think of the equation as a balance scale. Whatever you do to one side, do to the other.</p>
                <div class="balance-scale" id="balanceScale">
                    <div class="scale-pan" id="leftPan">?</div>
                    <div class="scale-beam"></div>
                    <div class="scale-pan" id="rightPan">?</div>
                </div>
                <div class="practice-area">
                    <div id="linearProblem" class="problem"></div>
                    <div class="input-group">
                        <label>x = </label>
                        <input type="number" step="any" id="linearAnswer" placeholder="Your answer">
                        <button onclick="checkLinear()">Check</button>
                        <button class="secondary" onclick="showLinearExplanation()">Explain Steps</button>
                        <button class="secondary" onclick="newLinearProblem()">New Problem</button>
                    </div>
                    <div id="linearFeedback" class="feedback"></div>
                    <div id="linearSteps" class="steps" style="display:none;"></div>
                </div>
                <button onclick="markComplete('linear')">Mark Topic Complete (+50 XP)</button>
            </div>
        </div>
    `;
}

function getSystems() {
    return `
        <div class="section">
            <h2>🔗 Systems of Equations</h2>
            <div class="card">
                <h3>Find the Intersection</h3>
                <p>Two lines cross at exactly one point (usually). Find that (x, y) pair.</p>
                <div class="practice-area">
                    <div id="systemProblem" class="problem"></div>
                    <div class="input-group">
                        <label>x = </label>
                        <input type="number" step="any" id="systemX" placeholder="x">
                        <label>y = </label>
                        <input type="number" step="any" id="systemY" placeholder="y">
                        <button onclick="checkSystem()">Check</button>
                        <button class="secondary" onclick="showSystemExplanation()">Explain Steps</button>
                        <button class="secondary" onclick="newSystemProblem()">New Problem</button>
                    </div>
                    <div id="systemFeedback" class="feedback"></div>
                    <div id="systemSteps" class="steps" style="display:none;"></div>
                </div>
                <button onclick="markComplete('systems')">Mark Topic Complete (+50 XP)</button>
            </div>
        </div>
    `;
}

function getQuadratic() {
    return `
        <div class="section">
            <h2>📈 Quadratic Equations</h2>
            <div class="card">
                <h3>Parabolas & Roots</h3>
                <p>Use the quadratic formula or factoring to find where the parabola crosses the x-axis.</p>
                <div class="practice-area">
                    <div id="quadProblem" class="problem"></div>
                    <div class="input-group">
                        <label>x₁ = </label>
                        <input type="number" step="any" id="quadX1" placeholder="Root 1">
                        <label>x₂ = </label>
                        <input type="number" step="any" id="quadX2" placeholder="Root 2">
                        <button onclick="checkQuadratic()">Check</button>
                        <button class="secondary" onclick="showQuadraticExplanation()">Explain Steps</button>
                        <button class="secondary" onclick="newQuadraticProblem()">New Problem</button>
                    </div>
                    <div id="quadFeedback" class="feedback"></div>
                    <div id="quadSteps" class="steps" style="display:none;"></div>
                </div>
                <button onclick="markComplete('quadratic')">Mark Topic Complete (+50 XP)</button>
            </div>
        </div>
    `;
}

function getPolynomials() {
    return `
        <div class="section">
            <h2>🧩 Polynomials & Factoring</h2>
            <div class="card">
                <h3>Break It Down</h3>
                <p>Factor into smaller pieces. Look for GCF, difference of squares, or trinomial patterns.</p>
                <div class="practice-area">
                    <div id="polyProblem" class="problem"></div>
                    <div class="input-group">
                        <input type="text" id="polyAnswer" placeholder="(x-2)(x-3)">
                        <button onclick="checkPolynomial()">Check</button>
                        <button class="secondary" onclick="showPolyExplanation()">Explain Steps</button>
                        <button class="secondary" onclick="newPolyProblem()">New Problem</button>
                    </div>
                    <div id="polyFeedback" class="feedback"></div>
                    <div id="polySteps" class="steps" style="display:none;"></div>
                </div>
                <button onclick="markComplete('polynomials')">Mark Topic Complete (+50 XP)</button>
            </div>
        </div>
    `;
}

function getExponents() {
    return `
        <div class="section">
            <h2>⚡ Exponents & Radicals</h2>
            <div class="card">
                <h3>Power Rules</h3>
                <p>Multiply powers by adding exponents. Roots are fractional exponents.</p>
                <div class="practice-area">
                    <div id="expProblem" class="problem"></div>
                    <div class="input-group">
                        <input type="text" id="expAnswer" placeholder="Simplified">
                        <button onclick="checkExponent()">Check</button>
                        <button class="secondary" onclick="showExpExplanation()">Explain Steps</button>
                        <button class="secondary" onclick="newExpProblem()">New Problem</button>
                    </div>
                    <div id="expFeedback" class="feedback"></div>
                    <div id="expSteps" class="steps" style="display:none;"></div>
                </div>
                <button onclick="markComplete('exponents')">Mark Topic Complete (+50 XP)</button>
            </div>
        </div>
    `;
}

function getRational() {
    return `
        <div class="section">
            <h2>➗ Rational Expressions</h2>
            <div class="card">
                <h3>Simplify by Canceling</h3>
                <p>Factor top and bottom, then cancel common factors. Watch for excluded values.</p>
                <div class="practice-area">
                    <div id="ratProblem" class="problem"></div>
                    <div class="input-group">
                        <input type="text" id="ratAnswer" placeholder="Simplified form">
                        <button onclick="checkRational()">Check</button>
                        <button class="secondary" onclick="showRatExplanation()">Explain Steps</button>
                        <button class="secondary" onclick="newRatProblem()">New Problem</button>
                    </div>
                    <div id="ratFeedback" class="feedback"></div>
                    <div id="ratSteps" class="steps" style="display:none;"></div>
                </div>
                <button onclick="markComplete('rational')">Mark Topic Complete (+50 XP)</button>
            </div>
        </div>
    `;
}

function getTools() {
    return `
        <div class="section">
            <h2>🛠️ Solver & Grapher</h2>
            <div class="card">
                <h3>Linear Equation Solver</h3>
                <div class="input-group">
                    <input type="number" id="linA" placeholder="a" value="2">
                    <span>x +</span>
                    <input type="number" id="linB" placeholder="b" value="3">
                    <span>=</span>
                    <input type="number" id="linC" placeholder="c" value="7">
                    <button onclick="solveLinear()">Solve</button>
                </div>
                <div id="linResult" class="steps"></div>
            </div>
            <div class="card">
                <h3>Quadratic Solver</h3>
                <div class="input-group">
                    <input type="number" id="quadA" placeholder="a" value="1">
                    <span>x² +</span>
                    <input type="number" id="quadB" placeholder="b" value="-5">
                    <span>x +</span>
                    <input type="number" id="quadC" placeholder="c" value="6">
                    <button onclick="solveQuadratic()">Solve</button>
                </div>
                <div id="quadResult" class="steps"></div>
            </div>
            <div class="card">
                <h3>Interactive Grapher</h3>
                <div class="input-group">
                    <select id="graphType" onchange="setupGraphInputs()">
                        <option value="linear">Linear: y = mx + b</option>
                        <option value="quadratic">Quadratic: y = ax² + bx + c</option>
                    </select>
                </div>
                <div id="graphInputs" class="input-group"></div>
                <div class="graph-container">
                    <canvas id="graphCanvas" width="600" height="400"></canvas>
                </div>
                <button onclick="drawGraph()">Graph It</button>
            </div>
        </div>
    `;
}

function getAchievements() {
    let html = `
        <div class="section">
            <h2>🏆 Achievements</h2>
            <p>Unlock badges by practicing and mastering topics.</p>
            <div class="achievement-grid">
    `;
    Object.values(achievements).forEach(ach => {
        html += `
            <div class="achievement ${ach.unlocked ? 'unlocked' : ''}">
                <div class="icon">${ach.icon}</div>
                <h3>${ach.name}</h3>
                <p style="font-size:0.85rem;color:var(--muted)">${ach.desc}</p>
                ${ach.unlocked ? '<span class="completed-badge">Unlocked</span>' : ''}
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

// Problem generators
function newLinearProblem() {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 11) - 5;
    const x = Math.floor(Math.random() * 11) - 5;
    const c = a * x + b;
    currentProblem = { a, b, c, x };
    const el = document.getElementById('linearProblem');
    if (el) {
        el.innerHTML = `Solve: $${a}x ${b >= 0 ? '+' : ''}${b} = ${c}$`;
        renderMath(el);
    }
    const ans = document.getElementById('linearAnswer');
    if (ans) ans.value = '';
    const fb = document.getElementById('linearFeedback');
    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
    const st = document.getElementById('linearSteps');
    if (st) st.style.display = 'none';
    updateBalance(a, b, c);
}

function updateBalance(a, b, c) {
    const left = document.getElementById('leftPan');
    const right = document.getElementById('rightPan');
    if (left && right) {
        left.textContent = `${a}x ${b >= 0 ? '+' : ''}${b}`;
        right.textContent = c;
    }
}

function showLinearExplanation() {
    const steps = document.getElementById('linearSteps');
    if (!steps || !currentProblem) return;
    const { a, b, c, x } = currentProblem;
    steps.style.display = 'block';
    steps.textContent = `How to solve linear equations (balance method):

1. Start with: ${a}x + ${b} = ${c}
2. Subtract ${b} from both sides:
   ${a}x + ${b} - ${b} = ${c} - ${b}
   ${a}x = ${c - b}
3. Divide both sides by ${a}:
   x = ${c - b} / ${a}
   x = ${x}

Key idea: Whatever you do to one side of the equation, do the exact same thing to the other side to keep it balanced.`;
}

function showSystemExplanation() {
    const steps = document.getElementById('systemSteps');
    if (!steps || !currentProblem) return;
    steps.style.display = 'block';
    steps.textContent = `How to solve systems of linear equations:

Method: Substitution or Elimination

1. Choose one equation and solve for one variable (e.g., solve the second equation for x or y).
2. Substitute that expression into the other equation.
3. Solve the resulting single-variable equation.
4. Plug the value back into one of the original equations to find the other variable.
5. Check your solution in both equations.

Solution for this problem: x = ${currentProblem.x}, y = ${currentProblem.y}

Tip: Elimination is often faster when coefficients match or can be made to match by multiplying.`;
}

function showQuadraticExplanation() {
    const steps = document.getElementById('quadSteps');
    if (!steps || !currentProblem) return;
    const roots = currentProblem.roots;
    steps.style.display = 'block';
    steps.textContent = `How to solve quadratic equations:

Method 1 - Factoring (when possible):
Look for two numbers that multiply to the constant term and add to the middle coefficient.

Method 2 - Quadratic Formula (always works):
x = [-b ± √(b² - 4ac)] / (2a)

For this problem the roots are: ${roots[0]} and ${roots[1]}

Steps with formula:
1. Identify a = 1, b = -(sum of roots), c = product of roots
2. Calculate discriminant: b² - 4ac
3. Take square root and apply ±
4. Simplify

The graph is a parabola that crosses the x-axis at these roots.`;
}

function showPolyExplanation() {
    const steps = document.getElementById('polySteps');
    if (!steps || !currentProblem) return;
    steps.style.display = 'block';
    steps.textContent = `How to factor this polynomial:

${currentProblem.expanded} = ${currentProblem.factored}

Steps:
1. Look at the constant term (${currentProblem.roots[0] * currentProblem.roots[1]}) and the coefficient of x (${-(currentProblem.roots[0] + currentProblem.roots[1])}).
2. Find two numbers that multiply to the constant and add to the middle coefficient.
3. Those numbers are ${currentProblem.roots[0]} and ${currentProblem.roots[1]}.
4. Write as (x - ${currentProblem.roots[0]})(x - ${currentProblem.roots[1]}).

Common patterns:
- Difference of squares: a² - b² = (a - b)(a + b)
- Perfect square trinomials
- Always factor out a GCF first if one exists.`;
}

function showExpExplanation() {
    const steps = document.getElementById('expSteps');
    if (!steps || !currentProblem) return;
    steps.style.display = 'block';
    steps.textContent = `Exponent & Radical Rules:

${currentProblem.steps}

Key rules:
• aᵐ · aⁿ = a^(m+n)
• (aᵐ)ⁿ = a^(m·n)
• aᵐ / aⁿ = a^(m-n)
• √a = a^(1/2)
• ⁿ√a = a^(1/n)

Always simplify exponents by applying these rules step by step.`;
}

function showRatExplanation() {
    const steps = document.getElementById('ratSteps');
    if (!steps || !currentProblem) return;
    steps.style.display = 'block';
    steps.textContent = `How to simplify rational expressions:

1. Factor the numerator completely.
2. Factor the denominator completely.
3. Cancel any common factors (as long as the factor ≠ 0).
4. State any restrictions (values that make the original denominator zero).

For this problem:
The numerator is a difference of squares.
Simplified form: ${currentProblem.simplified}

Remember: You cannot cancel terms that are added or subtracted — only factors that are multiplied.`;
}
    const userAnswer = parseFloat(document.getElementById('linearAnswer')?.value);
    const feedback = document.getElementById('linearFeedback');
    const steps = document.getElementById('linearSteps');
    if (!feedback) return;
    if (Math.abs(userAnswer - currentProblem.x) < 0.001) {
        feedback.textContent = 'Perfect balance! Correct!';
        feedback.className = 'feedback correct';
        if (steps) {
            steps.style.display = 'block';
            steps.textContent = `Steps:\n${currentProblem.a}x + ${currentProblem.b} = ${currentProblem.c}\n${currentProblem.a}x = ${currentProblem.c - currentProblem.b}\nx = ${currentProblem.x}`;
        }
        correctAnswer(20);
    } else {
        feedback.textContent = 'Not quite. Check the balance and try again.';
        feedback.className = 'feedback incorrect';
        if (steps) {
            steps.style.display = 'block';
            steps.textContent = `Hint: x = ${currentProblem.x}`;
        }
        wrongAnswer();
    }
}

function newSystemProblem() {
    const x = Math.floor(Math.random() * 6) + 1;
    const y = Math.floor(Math.random() * 6) + 1;
    const a1 = Math.floor(Math.random() * 3) + 1;
    const b1 = Math.floor(Math.random() * 3) + 1;
    const a2 = Math.floor(Math.random() * 3) + 1;
    const b2 = Math.floor(Math.random() * 3) - 1 || 1;
    const c1 = a1 * x + b1 * y;
    const c2 = a2 * x + b2 * y;
    currentProblem = { x, y };
    const el = document.getElementById('systemProblem');
    if (el) {
        el.innerHTML = `Solve:<br>$$\\begin{cases} ${a1}x + ${b1}y = ${c1} \\\\ ${a2}x + ${b2}y = ${c2} \\end{cases}$$`;
        renderMath(el);
    }
    document.getElementById('systemX') && (document.getElementById('systemX').value = '');
    document.getElementById('systemY') && (document.getElementById('systemY').value = '');
    const fb = document.getElementById('systemFeedback');
    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
}

function checkSystem() {
    const ux = parseFloat(document.getElementById('systemX')?.value);
    const uy = parseFloat(document.getElementById('systemY')?.value);
    const feedback = document.getElementById('systemFeedback');
    const steps = document.getElementById('systemSteps');
    if (!feedback) return;
    if (Math.abs(ux - currentProblem.x) < 0.001 && Math.abs(uy - currentProblem.y) < 0.001) {
        feedback.textContent = 'Intersection found! Correct!';
        feedback.className = 'feedback correct';
        correctAnswer(25);
    } else {
        feedback.textContent = 'Try again — check your algebra.';
        feedback.className = 'feedback incorrect';
        wrongAnswer();
    }
    if (steps) {
        steps.style.display = 'block';
        steps.textContent = `Solution: x = ${currentProblem.x}, y = ${currentProblem.y}`;
    }
}

function newQuadraticProblem() {
    const r1 = Math.floor(Math.random() * 6) + 1;
    const r2 = Math.floor(Math.random() * 7) - 3;
    const b = -(r1 + r2);
    const c = r1 * r2;
    currentProblem = { roots: [r1, r2].sort((a,b)=>a-b) };
    const el = document.getElementById('quadProblem');
    if (el) {
        el.innerHTML = `Solve: $x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$`;
        renderMath(el);
    }
    document.getElementById('quadX1') && (document.getElementById('quadX1').value = '');
    document.getElementById('quadX2') && (document.getElementById('quadX2').value = '');
    const fb = document.getElementById('quadFeedback');
    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
}

function checkQuadratic() {
    const u1 = parseFloat(document.getElementById('quadX1')?.value);
    const u2 = parseFloat(document.getElementById('quadX2')?.value);
    const roots = [u1, u2].sort((a,b)=>a-b);
    const feedback = document.getElementById('quadFeedback');
    const steps = document.getElementById('quadSteps');
    if (!feedback) return;
    const correct = currentProblem.roots;
    if (Math.abs(roots[0] - correct[0]) < 0.001 && Math.abs(roots[1] - correct[1]) < 0.001) {
        feedback.textContent = 'Roots found! Excellent!';
        feedback.className = 'feedback correct';
        player.quadraticSolved++;
        correctAnswer(30);
    } else {
        feedback.textContent = 'Not quite. Try the quadratic formula.';
        feedback.className = 'feedback incorrect';
        wrongAnswer();
    }
    if (steps) {
        steps.style.display = 'block';
        steps.textContent = `Roots: ${correct[0]} and ${correct[1]}`;
    }
}

function newPolyProblem() {
    const r1 = Math.floor(Math.random() * 5) + 1;
    const r2 = Math.floor(Math.random() * 5) + 1;
    currentProblem = { roots: [r1, r2], factored: `(x - ${r1})(x - ${r2})`, expanded: `x^2 - ${r1+r2}x + ${r1*r2}` };
    const el = document.getElementById('polyProblem');
    if (el) {
        el.innerHTML = `Factor: $${currentProblem.expanded}$`;
        renderMath(el);
    }
    document.getElementById('polyAnswer') && (document.getElementById('polyAnswer').value = '');
    const fb = document.getElementById('polyFeedback');
    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
}

function checkPolynomial() {
    const user = (document.getElementById('polyAnswer')?.value || '').replace(/\s/g, '');
    const feedback = document.getElementById('polyFeedback');
    const steps = document.getElementById('polySteps');
    if (!feedback) return;
    const ok = user.includes(currentProblem.roots[0].toString()) && user.includes(currentProblem.roots[1].toString());
    if (ok) {
        feedback.textContent = 'Nicely factored!';
        feedback.className = 'feedback correct';
        correctAnswer(20);
    } else {
        feedback.textContent = 'Look for two numbers that multiply to the constant term.';
        feedback.className = 'feedback incorrect';
        wrongAnswer();
    }
    if (steps) {
        steps.style.display = 'block';
        steps.textContent = `Factored: ${currentProblem.factored}`;
    }
}

function newExpProblem() {
    const problems = [
        { expr: '$2^3 \\cdot 2^4$', answer: ['2^7','128'], steps: 'Add exponents: 2^{3+4} = 2^7' },
        { expr: '$(3^2)^3$', answer: ['3^6','729'], steps: 'Multiply exponents: 3^{2×3} = 3^6' },
        { expr: '$\\sqrt{36}$', answer: ['6'], steps: '√36 = 6' },
        { expr: '$4^{1/2}$', answer: ['2'], steps: '4^{1/2} = √4 = 2' }
    ];
    currentProblem = problems[Math.floor(Math.random() * problems.length)];
    const el = document.getElementById('expProblem');
    if (el) {
        el.innerHTML = `Simplify: ${currentProblem.expr}`;
        renderMath(el);
    }
    document.getElementById('expAnswer') && (document.getElementById('expAnswer').value = '');
    const fb = document.getElementById('expFeedback');
    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
}

function checkExponent() {
    const user = (document.getElementById('expAnswer')?.value || '').toLowerCase().replace(/\s/g, '');
    const feedback = document.getElementById('expFeedback');
    const steps = document.getElementById('expSteps');
    if (!feedback) return;
    const ok = currentProblem.answer.some(a => user.includes(a.toLowerCase()));
    if (ok) {
        feedback.textContent = 'Simplified correctly!';
        feedback.className = 'feedback correct';
        correctAnswer(15);
    } else {
        feedback.textContent = 'Try again.';
        feedback.className = 'feedback incorrect';
        wrongAnswer();
    }
    if (steps) {
        steps.style.display = 'block';
        steps.textContent = currentProblem.steps + `\nPossible answers: ${currentProblem.answer.join(' or ')}`;
    }
}

function newRatProblem() {
    const r = Math.floor(Math.random() * 4) + 1;
    currentProblem = { simplified: `x + ${r}` };
    const el = document.getElementById('ratProblem');
    if (el) {
        el.innerHTML = `Simplify: $\\frac{x^2 - ${r*r}}{x - ${r}}$`;
        renderMath(el);
    }
    document.getElementById('ratAnswer') && (document.getElementById('ratAnswer').value = '');
    const fb = document.getElementById('ratFeedback');
    if (fb) { fb.textContent = ''; fb.className = 'feedback'; }
}

function checkRational() {
    const user = (document.getElementById('ratAnswer')?.value || '').replace(/\s/g, '');
    const feedback = document.getElementById('ratFeedback');
    const steps = document.getElementById('ratSteps');
    if (!feedback) return;
    if (user.includes(currentProblem.simplified.replace(/\s/g, '')) || user === currentProblem.simplified) {
        feedback.textContent = 'Beautifully simplified!';
        feedback.className = 'feedback correct';
        correctAnswer(20);
    } else {
        feedback.textContent = 'Factor the difference of squares and cancel.';
        feedback.className = 'feedback incorrect';
        wrongAnswer();
    }
    if (steps) {
        steps.style.display = 'block';
        steps.textContent = `Simplified form: ${currentProblem.simplified} (x ≠ root)`;
    }
}

function markComplete(topic) {
    if (!topics[topic].completed) {
        topics[topic].completed = true;
        addXP(50, 'Topic complete');
        showXPPopup('+50 XP Topic Complete!');
    }
    saveProgress();
    showSection(topic);
}

// Solvers
function solveLinear() {
    const a = parseFloat(document.getElementById('linA')?.value);
    const b = parseFloat(document.getElementById('linB')?.value);
    const c = parseFloat(document.getElementById('linC')?.value);
    const result = document.getElementById('linResult');
    if (!result) return;
    if (a === 0) {
        result.textContent = 'Error: Coefficient of x cannot be zero.';
        return;
    }
    const x = (c - b) / a;
    result.textContent = `Steps:\n${a}x + ${b} = ${c}\n${a}x = ${c - b}\nx = ${x.toFixed(4)}`;
}

function solveQuadratic() {
    const a = parseFloat(document.getElementById('quadA')?.value);
    const b = parseFloat(document.getElementById('quadB')?.value);
    const c = parseFloat(document.getElementById('quadC')?.value);
    const result = document.getElementById('quadResult');
    if (!result) return;
    if (a === 0) {
        result.textContent = 'Not quadratic — use the linear solver.';
        return;
    }
    const disc = b*b - 4*a*c;
    let text = `Discriminant: ${disc}\n`;
    if (disc > 0) {
        const x1 = (-b + Math.sqrt(disc)) / (2*a);
        const x2 = (-b - Math.sqrt(disc)) / (2*a);
        text += `Two real roots:\nx₁ = ${x1.toFixed(4)}\nx₂ = ${x2.toFixed(4)}`;
    } else if (disc === 0) {
        const x = -b / (2*a);
        text += `Repeated root:\nx = ${x.toFixed(4)}`;
    } else {
        text += `Complex roots (no real solutions)`;
    }
    result.textContent = text;
}

function setupGraphInputs() {
    const type = document.getElementById('graphType')?.value || 'linear';
    const container = document.getElementById('graphInputs');
    if (!container) return;
    if (type === 'linear') {
        container.innerHTML = `
            <label>m = </label><input type="number" id="gM" value="1" step="0.1">
            <label>b = </label><input type="number" id="gB" value="0" step="0.1">
        `;
    } else {
        container.innerHTML = `
            <label>a = </label><input type="number" id="gA" value="1" step="0.1">
            <label>b = </label><input type="number" id="gB" value="0" step="0.1">
            <label>c = </label><input type="number" id="gC" value="0" step="0.1">
        `;
    }
}

function drawGraph() {
    const canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    
    ctx.strokeStyle = '#8f857c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h/2);
    ctx.lineTo(w, h/2);
    ctx.moveTo(w/2, 0);
    ctx.lineTo(w/2, h);
    ctx.stroke();
    
    const type = document.getElementById('graphType')?.value;
    ctx.strokeStyle = '#c9895a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    const scale = 20;
    const centerX = w / 2;
    const centerY = h / 2;
    
    if (type === 'linear') {
        const m = parseFloat(document.getElementById('gM')?.value) || 0;
        const b = parseFloat(document.getElementById('gB')?.value) || 0;
        for (let px = 0; px <= w; px++) {
            const x = (px - centerX) / scale;
            const y = m * x + b;
            const py = centerY - y * scale;
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
    } else {
        const a = parseFloat(document.getElementById('gA')?.value) || 1;
        const b = parseFloat(document.getElementById('gB')?.value) || 0;
        const c = parseFloat(document.getElementById('gC')?.value) || 0;
        for (let px = 0; px <= w; px++) {
            const x = (px - centerX) / scale;
            const y = a * x * x + b * x + c;
            const py = centerY - y * scale;
            if (px === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
    }
    ctx.stroke();
}

function attachEventListeners() {
    document.querySelectorAll('.topic-card').forEach(card => {
        card.onclick = () => showSection(card.dataset.topic);
    });
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.onclick = () => showSection(btn.dataset.section);
    });
    if (currentSection === 'tools') setupGraphInputs();
    if (currentSection === 'linear') newLinearProblem();
    if (currentSection === 'systems') newSystemProblem();
    if (currentSection === 'quadratic') newQuadraticProblem();
    if (currentSection === 'polynomials') newPolyProblem();
    if (currentSection === 'exponents') newExpProblem();
    if (currentSection === 'rational') newRatProblem();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    showSection('dashboard');
});

// Global functions
window.showSection = showSection;
window.newLinearProblem = newLinearProblem;
window.checkLinear = checkLinear;
window.newSystemProblem = newSystemProblem;
window.checkSystem = checkSystem;
window.newQuadraticProblem = newQuadraticProblem;
window.checkQuadratic = checkQuadratic;
window.newPolyProblem = newPolyProblem;
window.checkPolynomial = checkPolynomial;
window.newExpProblem = newExpProblem;
window.checkExponent = checkExponent;
window.newRatProblem = newRatProblem;
window.checkRational = checkRational;
window.markComplete = markComplete;
window.showLinearExplanation = showLinearExplanation;
window.showSystemExplanation = showSystemExplanation;
window.showQuadraticExplanation = showQuadraticExplanation;
window.showPolyExplanation = showPolyExplanation;
window.showExpExplanation = showExpExplanation;
window.showRatExplanation = showRatExplanation;
window.solveLinear = solveLinear;
window.solveQuadratic = solveQuadratic;
window.drawGraph = drawGraph;
window.setupGraphInputs = setupGraphInputs;