/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas element's height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    let board = null;

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        board.update(dt)
        board.render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        //set game variables
        //changing these variables can change the game feel and difficulty significantly
        const numberOfColumns = 7;
        const rowTypes = ["water", "road", "road", "road", "road", "road", "road", "grass", "grass"];
        const numberOfEnemies = 15;
        const numberOfDiamonds = 3;
        const enemyIncrementRange = { min: 50, max: 500 };
        const cellVisualTemplateSprite = "images/road.png";
        const cellVisualTemplateImage = Resources.get(cellVisualTemplateSprite);
        const cellVisualTemplateDimensions = new Dimensions(cellVisualTemplateImage.width, cellVisualTemplateImage.height);
        const cellVisualTemplateOccupiedArea = new Area(new Point(0, 52), new Dimensions(101, 83));
        const cellVisualTemplate = new EntityVisual({sprite: cellVisualTemplateSprite, 
                                                     dimensions: cellVisualTemplateDimensions, 
                                                     occupiedArea: cellVisualTemplateOccupiedArea});
        
        //instantiating the board, which holds the game state and controls all game interaction
        board = new Board({
            numberOfColumns: numberOfColumns,
            rowTypes: rowTypes,
            numberOfEnemies: numberOfEnemies,
            numberOfDiamonds: numberOfDiamonds,
            enemyIncrementRange: enemyIncrementRange,
            cellVisualTemplate: cellVisualTemplate
        });

        //set canvas dimensions dynamically based on the specified board size
        canvas.width = numberOfColumns * cellVisualTemplateDimensions.width;
        canvas.height = (rowTypes.length - 1) * cellVisualTemplateOccupiedArea.height + cellVisualTemplateDimensions.height;
        doc.body.appendChild(canvas);

        //associate the input event listener with the player object
        doc.addEventListener("keyup", function (e) {
            var allowedKeys = {
                37: "left",
                38: "up",
                39: "right",
                40: "down"
            };

            board.player.moveInGrid(allowedKeys[e.keyCode]);
        });
        
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/road.png',
        'images/water.png',
        'images/grass.png',
        'images/enemy-right.png',
        'images/enemy-left.png',
        'images/player.png',
        'images/blood-left.png',
        'images/blood-right.png',
        'images/diamond.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);

