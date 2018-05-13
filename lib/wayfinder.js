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
 * @param String board - base name of file in boards directory
 * @param String movemements - string containing any combination of NWES
 * @param [Function] callback - optional callback if not using promises
 */
Wayfinder.prototype.init = function(board, movements, callback) {
    
    const self = this;
    self.board = board;
    
    return new Promise((resolve, reject) => {
        let board_file = path.join(process.cwd(), 'boards', `${self.board}.json`);
    
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
                         
               let config = JSON.parse(content);
               self.movements = movements;   
               self.start_x = config.starting_position[0];
               self.start_y = config.starting_position[1];
               self.matrix = config.matrix;
               
               // Convert movements to an array
               if(!Array.isArray(self.movements)) {
                   self.movements = self.movements.split('').map(dir => dir.toUpperCase());
               }

               // Validate movements can only be one of N,E,W,S
               let valid_movements = self.movements.filter(char => char.match(/n|e|w|s/i));

               if(valid_movements.length !== self.movements.length) {
                   err = 'Movements can only contain N,E,W,S';
                   if(callback) callback(err);
                   return reject(err);
               }
               
               // Ensure starting X position actually fits on the board
               if(self.start_x > self.matrix[0][1].length) {
                   err = 'Starting X is outside the board extent'
                   if(callback) callback(err);
                   return reject(err);
               }

               // Ensure starting Y position actually fits on the board
               if(self.start_y > self.matrix[0].length) {
                   err = 'Starting Y is outside the board extent';
                   if (callback) callback(err);
                   return reject(err);
               }

               self.current_x = self.start_x;
               self.current_y = self.start_y;
           
               if(callback) callback(null, self);
               resolve(self);        
           });
        });
    });           
};

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
        self.current_move += 1;
        
        console.log(`Notice: Cell avaiable, you now have ${self.coins} coins!`)
        
        return self.__move(direction);
        
    } else {
        let response = { final_x :  self.current_x, final_y : self.current_y, coins : self.coins, moves  : self.moves };  
        
        console.log(`Notice: Cell unavailable, game over!`)
 
        return response;
    }
};

module.exports = Wayfinder;