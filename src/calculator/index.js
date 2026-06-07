/**
 * @module calculator
 * @description Provides a high-level interface for evaluating mathematical expressions.
 * It integrates parsing and evaluation logic using `mathjs` for robustness.
 */

const { evaluateExpression } = require('./evaluator');
// const { parseExpression } = require('./parser'); // Not directly used here as math.evaluate handles parsing internally

/**
 * Evaluates a mathematical expression string.
 * This function serves as the primary entry point for calculation logic.
 * @param {string} expression - The mathematical expression to evaluate.
 * @returns {number | string | boolean | Object} The calculated result.
 * @throws {Error} If the expression is invalid or cannot be evaluated.
 */
function evaluate(expression) {
  if (!expression || typeof expression !== 'string') {
    throw new Error('Invalid input: Expression must be a non-empty string.');
  }

  try {
    // mathjs.evaluate can directly handle string expressions, performing both parsing and evaluation.
    // This simplifies the logic for the MVP while leveraging mathjs's full capabilities.
    const result = evaluateExpression(expression);

    // Handle potential undefined or complex results if necessary, though mathjs usually returns numbers/strings.
    return result;
  } catch (error) {
    // Re-throw with a more user-friendly message if needed, or just the original error.
    if (error.message.includes('Division by zero')) {
      throw new Error('Calculation Error: Division by zero.');
    }
    if (error.message.includes('SyntaxError')) {
        throw new Error(`Syntax Error: ${error.message.split('\n')[0]}.`);
    }
    throw new Error(`Calculation Error: ${error.message}`);
  }
}

module.exports = {
  evaluate,
};
