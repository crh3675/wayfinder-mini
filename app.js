/**
 * Wayfinder Mini App.
 *
 * This mini application is meant to boggle the user while they try to gather the most coins
 * while traversing a game board using different cardinal directions
 *
 * @link   https://github.com/crh3675/wayfinder-mini
 * @file   app.js - Main application loader
 * @author Craig R Hoover.
 * @copyright 2018, Craig R Hoover.
 */
const argparser = require('argparse').ArgumentParser;
const Wayfinder = require('./lib/wayfinder');
let args;

// Setup argument parser
var parser = new argparser({
    version : '1.0.0',
    addHelp :true,
    description : 'Wayfind application'
});

// Accept a list of user provided movemeents as any combination of NSEW
parser.addArgument(
  [ '-m', '--movements' ],
  {
    required : true,      
    help: `Movements to test. Movements are passed as a single string with cardinal directions.
    Any combination of N, S, E, or W are accepted.  This parameter is case-insensitive.
    `
  }
);

// Accept the base file name of a predefined board in the boards directory
parser.addArgument(
  [ '-b', '--board' ],
  {
    required : true,      
    help: `Board name - 5x5 or 10x10.  Boards are stored in the boards directory. Each board contains
    a matrix that the player can try to get through.  A 0 (zero) denotes a wall whereas any other
    value can be passed through.
    `
  }
);

args = parser.parseArgs();

// Invoke new Wayfinder instance and run
const runner = new Wayfinder();

runner.init(args.board, args.movements)
.then(runner => {
    return runner.execute()
})
.then(results => {
    console.log(results);    
});
