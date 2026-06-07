const expressionInput = document.getElementById('expression-input');
const resultDisplay = document.getElementById('result-display');
const buttonsGrid = document.querySelector('.buttons-grid');
const historyList = document.getElementById('history-list');

let currentExpression = '';
let lastResult = '';
let history = [];

// Helper to update display from ui.js
const updateInputDisplay = ui.updateInputDisplay;
const updateResultDisplay = ui.updateResultDisplay;
const addHistoryEntry = ui.addHistoryEntry;
const clearHistoryDisplay = ui.clearHistoryDisplay;

// Function to fetch calculation from backend
async function calculateExpression(expression) {
    try {
        const response = await fetch('/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ formula: expression }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong');
        }

        return data.result;
    } catch (error) {
        console.error('Error calculating expression:', error);
        return `Error: ${error.message}`;
    }
}

// Event listener for button clicks
buttonsGrid.addEventListener('click', async (event) => {
    const target = event.target;
    if (!target.classList.contains('btn')) return; // Not a button

    const value = target.dataset.value;
    const action = target.dataset.action;

    // Clear previous result if starting a new expression after an equals operation
    if (lastResult !== '' && !action && value) { // If lastResult exists and it's a number/operator
        if (['+', '-', '*', '/'].includes(value)) { // Append operator to last result
            currentExpression = lastResult + value;
        } else { // Start new expression with number
            currentExpression = value;
        }
        lastResult = '';
    } else if (lastResult !== '' && action === 'clear') {
        currentExpression = '';
        lastResult = '';
    } else if (lastResult !== '' && action === 'equals') {
        // Do nothing, already have a result, wait for new input
    } else if (lastResult !== '' && action === 'backspace') {
        currentExpression = currentExpression.slice(0, -1);
        lastResult = '';
    }
    
    if (action === 'clear') {
        currentExpression = '';
        lastResult = '';
        updateInputDisplay(expressionInput, '');
        updateResultDisplay(resultDisplay, '');
    } else if (action === 'backspace') {
        currentExpression = currentExpression.slice(0, -1);
        updateInputDisplay(expressionInput, currentExpression);
    } else if (action === 'equals') {
        if (currentExpression.trim() === '') return; // Don't calculate empty expression
        
        const result = await calculateExpression(currentExpression);
        lastResult = result;
        updateResultDisplay(resultDisplay, result);
        if (!result.startsWith('Error:')) {
            const entry = { expression: currentExpression, result: result };
            history.unshift(entry); // Add to beginning of history
            renderHistory();
        }
        // currentExpression is kept for potential further operations or to show in history input
    } else if (value) {
        currentExpression += value;
        updateInputDisplay(expressionInput, currentExpression);
        // Clear result display when typing new input, unless it's an operator after a result
        if (!['+', '-', '*', '/'].includes(value)) {
            updateResultDisplay(resultDisplay, '');
        }
    }
});

// Keyboard input handling
document.addEventListener('keydown', async (event) => {
    const key = event.key;

    if (key === 'Enter') {
        event.preventDefault(); // Prevent form submission if input is in a form
        document.querySelector('.btn-equals').click();
    } else if (key === 'Backspace') {
        event.preventDefault();
        document.querySelector('.btn-backspace').click();
    } else if (key === 'Escape') {
        event.preventDefault();
        document.querySelector('.btn-clear').click();
    } else if (/[0-9]/.test(key) || ['+', '-', '*', '/', '.', '(', ')'].includes(key)) {
        // Simulate button click for numbers and operators
        const btn = document.querySelector(`.btn[data-value="${key}"]`);
        if (btn) btn.click();
        else {
            // Directly append if button doesn't exist for a valid key (e.g., * for multiply)
            // Clear previous result if starting a new expression after an equals operation
            if (lastResult !== '' && !['+', '-', '*', '/'].includes(key)) { 
                currentExpression = key;
            } else if (lastResult !== '' && ['+', '-', '*', '/'].includes(key)) { 
                currentExpression = lastResult + key;
            } else {
                currentExpression += key;
            }
            lastResult = '';
            updateInputDisplay(expressionInput, currentExpression);
            updateResultDisplay(resultDisplay, '');
        }
    }
});

// Render history entries
function renderHistory() {
    clearHistoryDisplay(historyList);
    history.forEach((entry, index) => {
        const historyItem = addHistoryEntry(historyList, entry.expression, entry.result, index);
        historyItem.addEventListener('click', () => {
            currentExpression = entry.expression;
            lastResult = '';
            updateInputDisplay(expressionInput, currentExpression);
            updateResultDisplay(resultDisplay, entry.result);
        });
    });
}

// Initial rendering
renderHistory();
