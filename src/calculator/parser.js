/**
 * @module parser
 * @description This module is intended to parse mathematical expressions.
 * For EvalXpert MVP, parsing is delegated to the robust `mathjs` library.
 */

const math = require('mathjs');

/**
 * Parses a mathematical expression string into an Abstract Syntax Tree (AST).
 * In this MVP, it uses `mathjs.parse` internally.
 * @param {string} expression - The mathematical expression string.
 * @returns {math.MathNode} An AST node representing the parsed expression.
 * @throws {Error} If the expression is syntactically invalid.
 */
function parseExpression(expression) {
  return math.parse(expression);
}

module.exports = {
  parseExpression,
};
