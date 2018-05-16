const fs = require('fs');
const path = require('path');

/*
 * Wayfinder object instance
 */
const Wayfinder = function() {
    
    const self = this;
    self.matrix = [];
    self.board = null;
    self.start_x = null;
    self.start_y = null;
    self.coins = 0;
    self.movements = [];
    self.moves = 0;
    self.current_move = 0;
    self.current_x = null;
    self.current_y = null;
}

/*
 * Initialize the game
 * @param {String} board - base name of file in boards directory
 * @param {String} movemements - string containing any combination of NWES
 * @param [Function] callback - optional callback if not using promises
 */
Wayfinder.prototype.init = function(board, movements, random, custom, callback) {
    
    const self = this;
    
    return new Promise((resolve, reject) => {
       
       self.loadBoard(board, random, custom, callback)
       .then(config => {

           let start_x = config.starting_position[1];
           let start_y = config.starting_position[0];
           
           self.matrix = config.matrix;
           
           self
           .validateMovements(movements)
           .then(movements => {
               self.movements = movements;
            })
           .then(self.setStartingCoords(start_x, start_y))
           .then(() => {       
                if(callback) callback(null, self);
                resolve(self); 
            })
            .catch(err => {
                if(callback) callback(err);
                reject(err);     
            });
        })
        .catch(err => {
            reject(err)
        });
    });           
};

/*
 * Load the game board
 * @param {String} [board] - base name of file
 * @param {String} [random] - XxY coordinate for custom board
 */
Wayfinder.prototype.loadBoard = function(board, random, custom, callback) {
    const self = this;
    
    let config = {
        matrix : [],
        starting_position : [0, 0]
    }
    
    return new Promise((resolve, reject) => {
        
        if(custom) {
            self.loadCustom(custom, callback)
            .then((config) => {
                resolve(config)
            })
            .catch(err => {
                reject(err)
            })
            
        } else if(board) {
            let board_file = path.join(process.cwd(), 'boards', `${board}.json`);
    
            fs.stat(board_file, (err, stats) => {
                if(err) {
                    if(callback) callback(err);
                    return reject(err);
                }
                   
                fs.readFile(board_file, (err, content) => {
                    if(err) {
                        if(callback) callback(err);
                        return reject(err);
                    }
                                   
                    try {            
                        config = JSON.parse(content);
                    } catch(err) {
                        return reject(err);
                    }
                    resolve(config);
                });
            });
            
        } else if(random) {
            self.buildRandomBoard(random, callback)
            .then((config) => {
                resolve(config)
            })
            .catch(err => {
                reject(err)
            })
        }
    });
};

/*
 * Load a custom board from file path
 * @param {String} file_path
 * @param {Function} [callback]
 */
Wayfinder.prototype.loadCustom = function(file_path, callback) {
    const self = this;
    return new Promise((resolve, reject) => {
        fs.readFile(file_path, (err, contents) => {
            if(err) {
                return reject(err);
            }
            let config = {};
            try {
               config = JSON.parse(contents.toString())
            } catch(err) {
                return reject(err);
            }
            
            if(config.hasOwnProperty('starting_position') && config.hasOwnProperty('matrix')) {
                if(callback) callback(null, config);
                resolve(config);
            } else {
                let err = 'Custom board is not configurated correctly'
                if(callback) callback(err);
                reject(err)
            }            
        });        
    });
};

/*
 * Generate a random board with dimensions XxY
 * @param {String} random - XxY
 */
Wayfinder.prototype.buildRandomBoard = function(random, callback) {
    const self = this;
    
    let config = {
        matrix : [],
        starting_position : [0,0]
    }
    
    // Custom wall factor to randomize complexity
    let wall_factor = Math.floor(Math.random() * (10 - 3) + 3);

    return new Promise((resolve, reject) => {
        if(random.match(/(\d+)x(\d+)/)) {
            [ bounds, bound_x, bound_y ] = random.match(/(\d+)x(\d+)/);
            bound_x = +bound_x;
            bound_y = +bound_y;
            
            if(bound_x >= 1000 || bound_y >= 1000) {
                return reject('That board is way too big, try something smaller')
            }
            
            console.log(`Building custom board`);
            
            for(let y = 0; y < bound_y; y++) {
                for(let x = 0; x < bound_x; x++) {
                    if(typeof config.matrix[y] === 'undefined') config.matrix[y] = [];
                    config.matrix[y][x] = Math.floor(Math.random() * (x * y)) % wall_factor ? 1 : 0;
                }    
                console.log('    '+ config.matrix[y].toString());
            }            
            
            config.starting_position = [
                Math.floor(Math.random() * bound_x - 1),
                Math.floor(Math.random() * bound_y - 1)
            ];    
     
            resolve(config);
        } else {
            return reject(`Random build failed. Bounds of ${random} are invalid`);
        }
    });
}
                
/*
 * Execute instance of the game
 * @param [Function] callback - optional
 */
Wayfinder.prototype.execute = function(callback) {
    const self = this;

    let first_move = self.movements[0];
    let results = self.__move(first_move);

    if(callback) callback(null, results);
    return Promise.resolve(results);
}

/*
 * Expose function to validate movements
 * @param [String] movements - optional
 * @param [Function] callback - optional
 */
Wayfinder.prototype.validateMovements = function(movements, callback) {
    
    const self = this;
    movements = movements || self.movements;
    
    // Convert movements to an array
    if(!Array.isArray(movements)) {
        movements = movements.split('').map(dir => dir.toUpperCase());
    }
    
    // Validate movements can only be one of N,E,W,S
    let valid_movements = movements.filter(char => char.match(/n|e|w|s/i));

    if(valid_movements.length !== movements.length) {
        err = 'Movements can only contain N,E,W,S';
        if(callback) callback(err);
        return Promise.reject(err);
    }   
    
    if(callback) callback(null, movements); 
    return Promise.resolve(movements);
}

/*
 * Expose function to set or reset starting position
 * @param {Number} start_x
 * @param {Number} start_y
 */
Wayfinder.prototype.setStartingCoords = function(start_x, start_y, callback) {
    const self = this;
    
    return new Promise((resolve, reject) => {
        
        let board_width = self.matrix[1].length;
        let board_height = self.matrix.length;
    
        // Ensure starting X position actually fits on the board
        if(start_x > board_width) {
            err = 'Starting X is outside the board extent'
            if(callback) callback(err);
            return reject(err);
        }

        // Ensure starting Y position actually fits on the board
        if(start_y > board_height) {
            err = 'Starting Y is outside the board extent';
            if (callback) callback(err);
            return reject(err);
        }
        
        // Subtract board width and height as our 0,0 is bottom left
        self.start_x = board_width - start_x;
        self.start_y = board_height - start_y;
        self.current_x = self.start_x;
        self.current_y = self.start_y;
        
        resolve(self)
    });    
};

/*
 * Movement function to allow player to change directions
 * @param {String} direction - one of N, E, S or W
 */
Wayfinder.prototype.__move = function(direction) {
    
    const self = this;

    let cell = undefined;
    let x_iter = 0;
    let y_iter = 0;
    
    try {
        switch(direction) {
            case 'N':
                cell = self.matrix[self.current_y - 1][self.current_x];
                y_iter = -1;
                break;
            case 'S':
                cell = self.matrix[self.current_y + 1][self.current_x];
                y_iter = +1;
                break;
            case 'E':
                cell = self.matrix[self.current_y][self.current_x + 1];
                x_iter = +1;
                break;
            case 'W':
                cell = self.matrix[self.current_y][self.current_x - 1];
                x_iter = -1;
                break;
            default:
                cell = undefined;
        }
    } catch(err) {
        // We are trapping an out of range index error
        // Nothing to do with this error
    }
    
    if(cell && cell !== 0) {
        
        let next_move = self.current_move + 1;
        let direction = self.movements[next_move];
        
        self.moves += 1;
        self.coins += 1;
        self.current_x = self.current_x + x_iter;
        self.current_y  = self.current_y + y_iter;
        self.current_move = next_move;
        
        console.log(`Notice: Cell available, you now have ${self.coins} coins!`)
        
        return self.__move(direction);
        
    } else {
        
        // Subtract position from width and height as our 0,0 is bottom left
        let board_width = self.matrix[1].length;
        let board_height = self.matrix.length;
        
        let response = { final_x :  board_width - self.current_x, final_y : board_height - self.current_y, coins : self.coins, moves  : self.moves };  
        
        console.log(`Notice: Cell unavailable, game over!`)
 
        return response;
    }
};

module.exports = Wayfinder;