document.addEventListener('DOMContentLoaded', () => {
    // OS Switcher Logic
    const osTabs = document.querySelectorAll('.os-tab');
    const body = document.body;

    function setOS(os) {
        if (os === 'linux') {
            body.classList.remove('show-mac');
            body.classList.add('show-linux');
            localStorage.setItem('preferred-os', 'linux');
            osTabs.forEach(tab => {
                if (tab.dataset.os === 'linux') tab.classList.add('active');
                else tab.classList.remove('active');
            });
        } else {
            body.classList.remove('show-linux');
            body.classList.add('show-mac');
            localStorage.setItem('preferred-os', 'mac');
            osTabs.forEach(tab => {
                if (tab.dataset.os === 'mac') tab.classList.add('active');
                else tab.classList.remove('active');
            });
        }
    }

    osTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            setOS(tab.dataset.os);
        });
    });

    // Load saved OS or default to 'linux'
    const savedOS = localStorage.getItem('preferred-os') || 'linux';
    setOS(savedOS);

    // Sidebar Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('aside');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 1024) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });

    // Navigation highlight on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });

    // Copy Code Blocks
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const container = button.closest('.code-container');
            const codeElement = container.querySelector('code');
            
            // Extract code text, filtering out command prompts if any
            let codeText = codeElement.textContent;
            
            navigator.clipboard.writeText(codeText).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = `
                    <svg style="width:14px;height:14px;fill:var(--success)" viewBox="0 0 24 24">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                    </svg>
                    <span>コピー完了!</span>
                `;
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Copy failed: ', err);
            });
        });
    });

    // Theme Toggle (Light / Dark Mode)
    const themeBtn = document.querySelector('.theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            const isLight = body.classList.contains('light-theme');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            
            // Change button icon/text
            if (isLight) {
                themeBtn.innerHTML = `
                    <svg style="width:16px;height:16px;fill:currentColor" viewBox="0 0 24 24">
                        <path d="M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z" />
                    </svg>
                    <span>ダークモードへ</span>
                `;
            } else {
                themeBtn.innerHTML = `
                    <svg style="width:16px;height:16px;fill:currentColor" viewBox="0 0 24 24">
                        <path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" />
                    </svg>
                    <span>ライトモードへ</span>
                `;
            }
        });
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            body.classList.add('light-theme');
            themeBtn.click(); // Trigger update UI
        }
    }

    // ==========================================
    // LIGHTWEIGHT PYTHON INTERPRETER SIMULATOR
    // ==========================================
    const terminalBody = document.getElementById('terminal-body');
    const terminalInput = document.getElementById('terminal-input');
    const presetButtons = document.querySelectorAll('.preset-btn');
    const clearBtn = document.querySelector('.clear-btn');

    let pyVariables = {};

    function addTerminalLine(text, type = 'output-line') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        
        if (type === 'input-line') {
            line.innerHTML = `<span class="terminal-prompt">&gt;&gt;&gt;</span> <span>${escapeHtml(text)}</span>`;
        } else {
            line.innerHTML = `<span>${text.replace(/\n/g, '<br>')}</span>`;
        }
        
        // Insert before the input field wrapper
        const inputWrapper = terminalBody.querySelector('.terminal-input-wrapper');
        terminalBody.insertBefore(line, inputWrapper);
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function clearTerminal() {
        // Remove all lines except the welcome and the input wrapper
        const lines = terminalBody.querySelectorAll('.terminal-line');
        lines.forEach(line => line.remove());
        pyVariables = {};
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearTerminal);
    }

    // Python syntax line-by-line executor
    function executePythonLine(line) {
        line = line.trim();
        if (!line) return;

        // 1. Comments
        if (line.startsWith('#')) {
            return;
        }

        // 2. print(...) statements
        const printRegex = /^print\s*\((.*)\)$/;
        const printMatch = line.match(printRegex);
        if (printMatch) {
            const expression = printMatch[1].trim();
            if (!expression) {
                addTerminalLine('');
                return;
            }
            
            try {
                const result = evaluateExpression(expression);
                // format output nicely
                if (typeof result === 'string') {
                    addTerminalLine(result);
                } else if (result === undefined) {
                    addTerminalLine('None');
                } else {
                    addTerminalLine(String(result));
                }
            } catch (err) {
                addTerminalLine(`NameError: ${err.message}`, 'error-line');
            }
            return;
        }

        // 3. Variable assignments: name = value
        const assignRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/;
        const assignMatch = line.match(assignRegex);
        if (assignMatch) {
            const varName = assignMatch[1];
            const expr = assignMatch[2].trim();
            try {
                const val = evaluateExpression(expr);
                pyVariables[varName] = val;
            } catch (err) {
                addTerminalLine(`ValueError: ${err.message}`, 'error-line');
            }
            return;
        }

        // 4. Standalone calculations (like 5 + 3)
        try {
            const val = evaluateExpression(line);
            if (val !== undefined) {
                addTerminalLine(String(val));
            }
        } catch (err) {
            // If it's a completely unknown statement
            if (line.includes('def ') || line.includes('if ') || line.includes('for ')) {
                addTerminalLine(`SyntaxError: 複数行の制御構文（def, if, forなど）はこの簡易シミュレータでは行ごとの実行のみサポートしています。手元のパソコンのPython環境で試してみよう！`, 'error-line');
            } else {
                addTerminalLine(`SyntaxError: 入力されたプログラムを解釈できませんでした。スペルや文法を確認してみてね。`, 'error-line');
            }
        }
    }

    // Simplistic expression evaluator for basic math and variables
    function evaluateExpression(expr) {
        expr = expr.trim();

        // String literals e.g., "Hello" or 'Hello'
        if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            return expr.slice(1, -1);
        }

        // Numbers
        if (/^-?\d+(\.\d+)?$/.test(expr)) {
            return Number(expr);
        }

        // Boolean literals
        if (expr === 'True') return true;
        if (expr === 'False') return false;

        // String concatenation or additions (complex expression logic)
        // If containing '+', split and evaluate parts
        if (expr.includes('+')) {
            const parts = splitByTopLevelOperator(expr, '+');
            if (parts.length > 1) {
                const evaluatedParts = parts.map(p => evaluateExpression(p));
                // If any is a string, perform string concat, else numerical add
                if (evaluatedParts.some(p => typeof p === 'string')) {
                    return evaluatedParts.map(p => String(p)).join('');
                } else {
                    return evaluatedParts.reduce((sum, val) => sum + val, 0);
                }
            }
        }

        // Multiplication '*'
        if (expr.includes('*')) {
            const parts = splitByTopLevelOperator(expr, '*');
            if (parts.length > 1) {
                const evaluatedParts = parts.map(p => evaluateExpression(p));
                // String multiplication like "hello" * 3
                if (typeof evaluatedParts[0] === 'string' && typeof evaluatedParts[1] === 'number') {
                    return evaluatedParts[0].repeat(evaluatedParts[1]);
                } else if (typeof evaluatedParts[0] === 'number' && typeof evaluatedParts[1] === 'string') {
                    return evaluatedParts[1].repeat(evaluatedParts[0]);
                }
                return evaluatedParts.reduce((prod, val) => prod * val, 1);
            }
        }

        // Subtraction '-'
        if (expr.includes('-')) {
            const parts = splitByTopLevelOperator(expr, '-');
            if (parts.length > 1) {
                const evaluatedParts = parts.map(p => evaluateExpression(p));
                return evaluatedParts.reduce((diff, val, idx) => idx === 0 ? val : diff - val, 0);
            }
        }

        // Division '/'
        if (expr.includes('/')) {
            const parts = splitByTopLevelOperator(expr, '/');
            if (parts.length > 1) {
                const evaluatedParts = parts.map(p => evaluateExpression(p));
                return evaluatedParts.reduce((div, val, idx) => idx === 0 ? val : div / val, 0);
            }
        }

        // Variable lookups
        if (pyVariables.hasOwnProperty(expr)) {
            return pyVariables[expr];
        }

        // Check for specific functions like type() or len()
        const lenMatch = expr.match(/^len\s*\((.*)\)$/);
        if (lenMatch) {
            const val = evaluateExpression(lenMatch[1]);
            if (typeof val === 'string') return val.length;
            if (Array.isArray(val)) return val.length;
            throw new Error(`len() は文字列やリストにのみ使えます。`);
        }

        // Python lists e.g., [1, 2, 3]
        if (expr.startsWith('[') && expr.endsWith(']')) {
            const inner = expr.slice(1, -1).trim();
            if (!inner) return [];
            return inner.split(',').map(item => evaluateExpression(item.trim()));
        }

        // Unknown identifier
        throw new Error(`変数名 '${expr}' は定義されていません。スペルミスがないか確認してください。`);
    }

    // Helper to split expressions by operators, ignoring operators inside quotes
    function splitByTopLevelOperator(expr, operator) {
        let parts = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];
            if ((char === '"' || char === "'") && (i === 0 || expr[i-1] !== '\\')) {
                if (!inQuote) {
                    inQuote = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuote = false;
                }
            }

            if (char === operator && !inQuote) {
                parts.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        parts.push(current.trim());
        return parts;
    }

    // Event listener for Terminal Input
    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value;
                if (!command.trim()) return;

                // Add to terminal history
                addTerminalLine(command, 'input-line');
                
                // Clear input
                terminalInput.value = '';

                // Check built-in mock commands
                if (command.trim() === 'clear' || command.trim() === 'clear()') {
                    clearTerminal();
                    return;
                }
                
                // Execute
                executePythonLine(command);
            }
        });
    }

    // Click terminal to focus input
    const terminalMain = document.querySelector('.terminal-simulator');
    if (terminalMain && terminalInput) {
        terminalMain.addEventListener('click', () => {
            terminalInput.focus();
        });
    }

    // Preset examples injection
    presetButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid focusing terminal and executing immediately
            const code = btn.dataset.code;
            if (terminalInput) {
                terminalInput.value = code;
                terminalInput.focus();
            }
        });
    });


    // ==========================================
    // INTERACTIVE QUIZ ENGINE
    // ==========================================
    const quizOptions = document.querySelectorAll('.quiz-option');
    
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            const card = option.closest('.quiz-card');
            const feedback = card.querySelector('.quiz-feedback');
            const options = card.querySelectorAll('.quiz-option');
            const isCorrect = option.dataset.correct === 'true';

            // Disable all options once answered
            options.forEach(opt => {
                opt.style.pointerEvents = 'none';
                if (opt.dataset.correct === 'true') {
                    opt.classList.add('correct');
                }
            });

            if (isCorrect) {
                option.classList.add('correct');
                feedback.innerHTML = '✨ <strong>正解！</strong> よくできました！解説：' + feedback.dataset.explain;
                feedback.className = 'quiz-feedback show success';
            } else {
                option.classList.add('incorrect');
                feedback.innerHTML = '❌ <strong>残念、ちがいます！</strong> 正しい答えを確認しよう！解説：' + feedback.dataset.explain;
                feedback.className = 'quiz-feedback show error';
            }
        });
    });


    // ==========================================
    // MINI JANKEN GAME
    // ==========================================
    const gameChoices = document.querySelectorAll('.game-choice');
    const gameStatus = document.getElementById('game-status');
    const playerResult = document.getElementById('player-choice-result');
    const computerResult = document.getElementById('computer-choice-result');
    const winsVal = document.getElementById('wins-count');

    let wins = 0;
    const hands = {
        'rock': '✊',
        'paper': '✋',
        'scissors': '✌️'
    };

    gameChoices.forEach(choice => {
        choice.addEventListener('click', () => {
            const playerHand = choice.dataset.hand;
            
            // Computer choice (random)
            const handKeys = Object.keys(hands);
            const computerHand = handKeys[Math.floor(Math.random() * handKeys.length)];

            // Show choices
            playerResult.textContent = hands[playerHand];
            computerResult.textContent = hands[computerHand];

            // Decide winner
            let resultText = '';
            if (playerHand === computerHand) {
                resultText = 'あいこです！ 🤝';
                gameStatus.style.color = 'var(--text-primary)';
            } else if (
                (playerHand === 'rock' && computerHand === 'scissors') ||
                (playerHand === 'scissors' && computerHand === 'paper') ||
                (playerHand === 'paper' && computerHand === 'rock')
            ) {
                resultText = 'あなたの勝ち！ 🎉';
                gameStatus.style.color = 'var(--success)';
                wins++;
                winsVal.textContent = wins;
            } else {
                resultText = 'コンピューターの勝ち！ 🤖';
                gameStatus.style.color = 'var(--danger)';
            }

            gameStatus.textContent = resultText;
            gameStatus.style.animation = 'none';
            // Trigger reflow
            gameStatus.offsetHeight;
            gameStatus.style.animation = 'fadeIn 0.2s ease-in-out';
        });
    });
});
