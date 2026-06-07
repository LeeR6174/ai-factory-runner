const ui = {
    /**
     * Updates the content of the expression input field.
     * @param {HTMLInputElement} element - The input element.
     * @param {string} value - The new value to set.
     */
    updateInputDisplay: (element, value) => {
        element.value = value;
    },

    /**
     * Updates the content of the result display area.
     * @param {HTMLElement} element - The result display element.
     * @param {string} value - The new value to set.
     */
    updateResultDisplay: (element, value) => {
        element.textContent = value;
    },

    /**
     * Adds a new entry to the history list.
     * @param {HTMLUListElement} historyListElement - The UL element for history.
     * @param {string} expression - The mathematical expression.
     * @param {string} result - The result of the expression.
     * @param {number} index - The index of the history item (for unique ID).
     * @returns {HTMLLIElement} The created history list item element.
     */
    addHistoryEntry: (historyListElement, expression, result, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'history-item';
        listItem.dataset.index = index; // Unique identifier for the item

        const expressionSpan = document.createElement('div');
        expressionSpan.className = 'history-expression';
        expressionSpan.textContent = expression;

        const resultSpan = document.createElement('div');
        resultSpan.className = 'history-result';
        resultSpan.textContent = `= ${result}`;

        listItem.appendChild(expressionSpan);
        listItem.appendChild(resultSpan);
        historyListElement.appendChild(listItem);
        return listItem;
    },

    /**
     * Clears all entries from the history list.
     * @param {HTMLUListElement} historyListElement - The UL element for history.
     */
    clearHistoryDisplay: (historyListElement) => {
        historyListElement.innerHTML = '';
    }
};

// Export ui object to make it globally accessible in app.js
// In a more complex setup, one might use modules (import/export)
// For this simple setup, attaching to window is a common pattern for small scripts.
window.ui = ui;
