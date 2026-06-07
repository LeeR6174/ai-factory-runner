const calculator = require('../calculator');

/**
 * Handles POST requests to the /api/calculate endpoint.
 * Expects a JSON body with a 'formula' field.
 */
async function handleCalculation(req, res) {
  const { formula } = req.body;

  if (typeof formula !== 'string' || formula.trim() === '') {
    return res.status(400).json({ error: 'Invalid input: \'formula\' must be a non-empty string.' });
  }

  try {
    const result = calculator.evaluate(formula);
    res.json({ formula, result: result.toString() }); // Ensure result is a string for consistent API output
  } catch (error) {
    console.error('Calculation API Error:', error.message);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  handleCalculation,
};
