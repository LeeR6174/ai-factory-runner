/**
 * @module evaluator
 * @description This module evaluates parsed mathematical expressions.
 * For EvalXpert MVP, evaluation is delegated to the robust `mathjs` library.
 */

const math = require('mathjs');

/**
 * Evaluates a given mathematical expression (or an AST node) to its numerical result.
 * In this MVP, it uses `mathjs.evaluate` internally for simplicity and robustness.
 * @param {string | math.MathNode} expressionOrNode - The mathematical expression string or a parsed MathNode.
 * @param {Object} [scope={}] - An optional scope for variables.
 * @returns {number | string | boolean | Object} The result of the evaluation.
 * @throws {Error} If the expression cannot be evaluated (e.g., division by zero, invalid function).
 */
function evaluateExpression(expressionOrNode, scope = {}) {
  return math.evaluate(expressionOrNode, scope);
}

module.exports = {
  evaluateExpression,
};
