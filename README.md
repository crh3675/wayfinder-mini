Wayfinder Mini-App
====================
This is a mini wayfinder application that gives the player coins for every successful move.

The functionality is similar to PacMan, just without ghosts chasing you!  You can easily create boards by adding a configuration to the boards directory.  A board is a JSON file with the following structure:

```javascript
    {
        "starting_position" : [x, y],
        "matrix" : [
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            [1,0,1,0,1,0,1,0],
            etc...
        ]
    }
```

Each 0 (zero) represents a wall that cannot be passed whereas any other character (non-whitespace) represents a part of the board that the player can move into.

To play the game, you would first need to run:

    npm install
    
There is only one module so it should be quite fast.  To see command line options, you can type:

    node app.js -h
    
A sample command line execution would be:

    node app -b 5x5 -m NNEWSWESNS
    
Thats it!  You will be provided a console notice that contains how far you got in the game.