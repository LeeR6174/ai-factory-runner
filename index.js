#!/usr/bin/env node

const readline = require('readline');

/**
 * Safely evaluates a basic mathematical expression.
 * Restricts input to numbers, operators (+, -, *, /), parentheses, and decimals.
 * @param {string} expr 
 * @returns {number}
 */
function evaluateExpression(expr) {
    // Remove all whitespace
    const sanitized = expr.replace(/\s+/g, '');

    if (!sanitized) {
        throw new Error('Expression is empty');
    }

    // Only allow digits, basic operators, decimal points, and parentheses
    const validPattern = /^[0-9+\-*/().]+$/;

    if (!validPattern.test(sanitized)) {
        throw new Error('Invalid characters in expression. Only numbers and +, -, *, /, (, ) are allowed.');
    }

    try {
        // Use Function constructor securely after validation
        const result = new Function(`return (${sanitized});`)();
        
        if (result === undefined || Number.isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid mathematical calculation');
        }
        
        return result;
    } catch (err) {
        throw new Error('Malformed expression or division by zero');
    }
}

/**
 * Prints usage instructions.
 */
function printUsage() {
    console.log('Simple Calculator CLI');
    console.log('====================');
    console.log('Usage:');
    console.log('  node index.js "<expression>"   Evaluate the expression directly');
    console.log('  node index.js                  Enter interactive mode');
    console.log('\nExamples:');
    console.log('  node index.js "2 + 3 * 4"');
    console.log('  node index.js "(10 - 2) / 4"');
}

/**
 * Starts the REPL (Read-Eval-Print Loop) interactive mode.
 */
function startInteractiveMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'calc> '
    });

    console.log('Interactive Calculator. Type "exit", "quit", or "q" to leave.');
    rl.prompt();

    rl.on('line', (line) => {
        const input = line.trim();
        const lowerInput = input.toLowerCase();
        
        if (lowerInput === 'exit' || lowerInput === 'quit' || lowerInput === 'q') {
            rl.close();
            return;
        }

        if (input) {
            try {
                const result = evaluateExpression(input);
                console.log(result);
            } catch (err) {
                console.error(`Error: ${err.message}`);
            }
        }
        rl.prompt();
    }).on('close', () => {
        console.log('\nGoodbye!');
        process.exit(0);
    });
}

// Main CLI Entrypoint
const args = process.argv.slice(2);

if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
}

if (args.length > 0) {
    // Join arguments to handle cases where quotes are omitted (e.g., node index.js 2 + 2)
    const expression = args.join(' ');
    try {
        const result = evaluateExpression(expression);
        console.log(result);
        process.exit(0);
    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
} else {
    startInteractiveMode();
}