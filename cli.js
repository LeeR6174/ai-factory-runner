#!/usr/bin/env node

const { Command } = require('commander');
const calculator = require('./src/calculator');

const program = new Command();

program
  .name('evalxpert')
  .description('A powerful Node.js CLI utility to evaluate mathematical expressions.')
  .version('1.0.0');

program.argument('<expression>', 'The mathematical expression to evaluate')
  .action((expression) => {
    try {
      const result = calculator.evaluate(expression);
      console.log(result);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);

// If no arguments are provided, show help
if (process.argv.length === 2) {
  program.help();
}
