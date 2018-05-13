const Wayfinder = require('./lib/wayfinder');
const assert = require('assert');

const testMissingBoard = function() {

    let runner = new Wayfinder();
    runner.init('XXXX', 'NEWS')
    .catch(err => {
        assert(err.toString().match(/no such file/))
    });
}

const testGoodCoordinates = function() {

    let runner = new Wayfinder();
    runner.init('5x5', 'NEWS')
    .then(runner => {
        return runner.setStartingCoords(3, 2)
    })
    .then(results => {
        assert(results)
    })
    .catch(err => {
        assert.fail(err.toString())
    });
}

const testBadCoordinates = function() {

    let runner = new Wayfinder();
    runner.init('5x5', 'NEWS')
    .then(runner => {
        return runner.setStartingCoords(18, 24)
    })
    .catch(err => {
        assert(err.toString().match(/outside the board extent/))
    });
}

const testBadMovements = function() {

    let runner = new Wayfinder();
    runner.init('5x5', 'NEWS')
    .then(runner => {
        return runner.validateMovements('PQRS')
    })
    .catch(err => {
        assert(err.toString().match(/Movements can only contain/))
    });
}

const testGoodMovements = function() {

    let runner = new Wayfinder();
    runner.init('5x5', 'NEWS')
    .then(runner => {
        return runner.validateMovements('NEWS')
    })
    .then(results => {
        assert(results);
    })
    .catch(err => {
        assert.fail(err.toString())
    });
}

testMissingBoard();
testBadCoordinates();
testBadMovements();
testGoodMovements();
