/* app.js
 * This file provies the classes representing all game concepts and functionality.
 * Execution of the game is managed by the engine code in engine.js
 */

/**
 * A Point in 2D space
 */
class Point {
    /**     
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x = 0, y = 0) {
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
    }

    /**
     * Returns a copy of this as a new Point instance 
     */
    clone() {
        return new Point(this.x, this.y);
    }

    /**
     * Returns a new Point instance offset by the provided values
     * @param {number} xOffset the offset to add to x
     * @param {number} yOffset the offset to add to y
     */
    offset(xOffset = 0, yOffset = 0) {
        return new Point(this.x + xOffset, this.y + yOffset);
    }
}

/**
 * Represents a set of dimensions in 2D space
 */
class Dimensions {
    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width = 0, height = 0){
        /** @type {number} */
        this.width = width;
        /** @type {number} */
        this.height = height;
    }

    /**
     * Returns a copy of this as a new Dimensions instance
     */
    clone() {
        return new Dimensions(this.width, this.height);
    }
}

/**
 * Represents an area in 2D space
 * For this project the term 'area' is equivalent to 'rectangular area'
 */
class Area {
    /**
     * @param {Position} position the position of the top left corner of the area in 2D space
     * @param {Dimensions} dimensions the dimensions of the area in 2D space
     */
    constructor(position = new Point(), dimensions = new Dimensions()) {
        if(!position) throw new Error("an area must have a position");
        if(!dimensions) throw new Error("an area must have dimensions");
        /** 
         * @description the position of the top left corner of the area in 2D space
         * @type {Position} 
         */
        this.position = position;
        /**
         * @description the dimensions of the area in 2D space
         * @type {Dimensions}
         */
        this.dimensions = dimensions;
    }

    /**
     * @returns {number} the width of the area
     */
    get width() {
        return this.dimensions.width;
    }

    /**
     * @returns {number} the height of the area
     */
    get height() {
        return this.dimensions.height;
    }
    
    /**
     * @returns {Point} the point in space of the top left corner of the area
     */
    get topLeft() {
        return this.position.clone();
    }

    /**
     * @returns {Point} the point in space of the top right corner of the area
     */
    get topRight() {
        return new Point(this.position.x + this.dimensions.width, this.position.y);
    }

    /**
     * @returns {Point} the point in space of the bottom left corner of the area
     */
    get bottomLeft() {
        return new Point(this.position.x, this.position.y + this.dimensions.height);
    }

    /**
     * @returns {Point} the point in space of the bottom right corner of the area
     */
    get bottomRight() {
        return new Point(this.position.x + this.dimensions.width, this.position.y + this.dimensions.height);
    }

    /**
     * @returns {Point[]} an array containing the positions of all four corners of the area
     */
    get corners() {
        return [this.topLeft, this.topRight, this.bottomLeft, this.bottomRight];
    }

    /**
     * @returns {Point} the point in space of center of the area
     */
    get center() {
        return new Point(this.position.x + this.dimensions.width/2, this.position.y + this.dimensions.height/2);
    }

    /**
     * returns a boolean indicating whether a provided object in 2D space is contained by this area
     * @param {Point|Area} objectInSpace the point or area to test
     * @returns {boolean} true if the provided object in 2D space is contained by this area
     */
    contains(objectInSpace) {
        if (objectInSpace instanceof Point) {
            //a position in space needs to be tested relative to all corners of an area 
            //in order to determine if it is contained within the area
            return objectInSpace.x >= this.topLeft.x &&
                   objectInSpace.x <= this.topRight.x &&
                   objectInSpace.y >= this.topLeft.y &&
                   objectInSpace.y <= this.bottomLeft.y;
        }
        if (objectInSpace instanceof Area) {
            //an area is completely contained if all corners are contained by the area
            return objectInSpace.corners.every(corner => this.contains(corner));
        }
        throw new Error("only objects of type Point and Area are supported");
    }

    /**
     * returns a boolean indicating whether a provided object in 2D space intersects with this area
     * @param {Point|Area} objectInSpace the point or area to test
     * @returns {boolean} true if the provided object in 2D space intersects with this area
     */
    intersectsWith(objectInSpace) {
        if(objectInSpace instanceof Point){
            //for points intersection and containment is the same
            return this.contains(objectInSpace);
        }
        if(objectInSpace instanceof Area){
            //two areas intersect if at least one point of an area is contained by the other.
            //testing both ways ensures that cases where one area is contained by the other will lead to the right conclusion.
            return objectInSpace.corners.some(corner => this.contains(corner)) || this.corners.some(corner => objectInSpace.contains(corner));
        }
        throw new Error("only objects of type Point and Area are supported");
    }

    /**
     * Returns a new Area instance offset by the provided values
     * @param {number} xOffset the offset to add to x
     * @param {number} yOffset the offset to add to y
     */
    offset(xOffset = 0, yOffset = 0){
        return new Area(this.position.offset(xOffset, yOffset), this.dimensions.clone());
    }

    /**
     * returns a copy of this area centered on a provided object in 2D space as a new Area instance
     * @param {Point|Area} objectInSpace the point or area to center this area on
     */
    centerOn(objectInSpace) {
        if (objectInSpace instanceof Point) {
            return new Area(new Point(objectInSpace.x - this.dimensions.width / 2, objectInSpace.y - this.dimensions.height / 2), this.dimensions);
        }
        if (objectInSpace instanceof Area) {
            //centering an area on another area is equal to centering on its center point
            return this.centerOn(objectInSpace.center);
        }
        throw new Error("only objects of type Point and Area are supported");
    }
}

/**
 * represents the visual representation of a game entity including metadata of its occupancy in 2D space
 */
class EntityVisual {
    constructor({sprite, dimensions = null, occupiedArea = null}) {
        /**
         * @description the relative path to the image that is to visually represent an entity
         * @type {string}
         */
        this.sprite = sprite;
        /**
         * @description the dimensions in pixels of the image that is to visually represent an entity
         * @type {Dimensions}
         */
        this.dimensions = dimensions;
        /**
         * @description the area of the central visual element within the image.
         *      by defining this area within an image a physical presence can be simulated and more realistic collision detection is possible.
         *      the position of the area is relative to the position of the entity to which the entity visual is associated.
         * @type {Area}
         */
        this.occupiedArea = null;
        if (occupiedArea){
            this.occupiedArea = occupiedArea;
        }
        else {
            //if no value is provided the occupied area is equal to the are of the full visual
            this.occupiedArea = new Area(new Point(0, 0), this.dimensions);
        }
    }   
}

/**
 * represents an entity on the board of the game.
 * an entity always has a visual representation, and a position relative to the board.
 * @abstract
 */
class Entity {
    /**
     * @param {Object} param
     * @param {Board} param.board the board that the entity belongs to
     * @param {EntityVisual} param.visual the visual representation of the entity
     * @param {Point} param.position the position of the entity relative to its board
     * @param {number} param.zIndex the stack order of entities in the board, entities with a lower zIndex are painted before those with higher ones
     * @param {number} param.hitScoreIncrement the increment in the player score if hit
     * @param {boolean} param.removeOnHit true if the entity is to be removed after being hit
     */
    constructor({board, visual, position = new Point(0,0), zIndex = 0, hitScoreIncrement = 0, removeOnHit = false}) {
        if (!board) throw new Error("a board is required");
        if (!visual) throw new Error("a visual representation is required");
        /**
         * @description the board that the entity belongs to
         * @protected
         * @type {Board}
         */
        this._board = board;
        /**
         * @description the visual representation of the entity
         * @protected
         * @type {EntityVisual}
         */
        this._visual = visual;
        /**
         * @description the position of the entity relative to its board
         * @type {Point}
         * @protected
         */
        this._position = position;
        /**
         * @description the stack order of entities in the board, entities with a lower zIndex are painted before those with higher ones
         * @type {number}
         * @protected
         */
        this.zIndex = zIndex;
        /**
         * @description true if the entity is to be removed after being hit
         * @type {boolean}
         */
        this.removeOnHit = removeOnHit;
        /**
         * @description the increment in the player score value if hit
         * @type {number}
         */
        this.hitScoreIncrement = hitScoreIncrement;
    }

    /**
     * @returns {Position} the position of the entity relative to its board
     */
    get position() {
        return this._position;
    }

    /**
     * @param {position} position the position of the entity relative to its board
     */
    set position(position) {
        this._position = position;
    }

    /**
     * @returns {Dimensions} the dimensions of the full visual representation of the entity
     */
    get dimensions() {
        return this._visual.dimensions;
    }

    /**
     * @returns {Area} the area relative to the board representing the full visual representation of the entity
     */
    get area() {
        return new Area(this._position, this._visual.dimensions);
    }

    /**
     * @returns {Area} the area relative to the board representing the central visual element within the visual 
     *      representation of the entity.
     */
    get occupiedArea() {
        return this._visual.occupiedArea.offset(this._position.x, this._position.y);
    }

    /**
     * @returns {EntityVisual} the visual representation of the entity
     */
    get visual() {
        return this._visual;
    }    

    /**
     * returns a boolean indicating whether the central visual element of this entity touches that of another.
     * @param {Entity} entity
     * @returns {bool} true if the areas of the central visual elements of the entities intersects
     */
    touches(entity) {
        return this.occupiedArea.intersectsWith(entity.occupiedArea);
    }

    /**
     * renders the entity on the game canvas based on its position relative to the board
     */
    render() {
        ctx.drawImage(Resources.get(this._visual.sprite), this._position.x, this._position.y);
    }

    /**
     * Moves the entity to the center of a a specified board grid cell.
     * The operation is performed using occupied areas to make it appear visually natural for users.
     * Concretely the central visual element of the entity will be centered on the central visual element
     * of the cell regardless of the rest of the content, e.g. transparent background of images used.
     * @param {number} row the row of the board grid cell that the entity is to be moved to
     * @param {number} column the column of the board grid cell the entity is to be moved to
     */
    moveToCell(row, column) {
        const cellArea = this._board.grid.getCell(row, column).occupiedArea;
        const actorArea =  this.occupiedArea;
        //gets an area representing the entity centered on the (occupied) cell area
        const newActorArea = actorArea.centerOn(cellArea);
        //the position of this entity is set based on the calculated position of its occupied area
        this._position = this._position.offset(newActorArea.position.x - actorArea.position.x, newActorArea.position.y - actorArea.position.y);
    }

    /**
     * @returns {boolean} true if part of the central visual element of the entity is within the board area
     */
    get someOnTheBoard() {
        return this.occupiedArea.intersectsWith(this._board.grid.occupiedArea);
    }

    /**
     * @returns {boolean} true if all of the central visual element of the entity is within the board area
     */
    get allOnTheBoard() {
        return this._board.area.contains(this.occupiedArea);
    }
}

/**
 * abstract entity representing an actor on the board of the game
 * an actor is an entity that can act, e.g. move
 */
class Actor extends Entity {
    /**
     * @param {Object} param
     * @param {Board} param.board the board that the entity belongs to
     * @param {EntityVisual} param.visual the visual representation of the entity
     * @param {Point} param.position the position of the entity relative to its board
     * @param {number} param.zIndex the stack order of entities in the board, entities with a lower zIndex are painted before those with higher ones
     * @param {number} param.hitScoreIncrement the increment in the player score if hit by the player
     * @param {boolean} param.removeOnHit true if the actor is to be removed after being hit
     * @param {boolean} param.canMoveOutsideBoard a boolean indicating whether the actor is allowed to move outside the board
     */
    constructor({board, visual, position = new Point(0,0), zIndex = 0, hitScoreIncrement = 0, removeOnHit = false, canMoveOutsideBoard = false}) {
        super({board: board, visual: visual, position: position, zIndex: zIndex, hitScoreIncrement: hitScoreIncrement, removeOnHit: removeOnHit});
        /**
         * @description true if the actor is allowed to move outside the board
         * @type {boolean}
         */
        this.canMoveOutsideBoard = canMoveOutsideBoard;
    }

    /**
     * returns a boolean indicating whether a actor is allowed to move along a specified vector from its current position in 2Dspace
     * @param {Object} increment a vector representing the position to move to relative to the current position
     * @param {number} increment.x the horizontal increment of the vector in 2D space
     * @param {number} increment.y the vertical increment of the vector in 2D space
     * @returns {boolean} true if the actor is allowed to the position specified by the increment vector
     */
    canMove(increment = { x: 0, y: 0 }) {
        //if an actor is allowed to move to any position relative to its board retuyn true
        if (this.canMoveOutsideBoard) return true;
        const newOccupiedArea = this.occupiedArea.offset(increment.x, increment.y);
        //return true if part of the actors occupied area (visible appearance) is within the board
        return newOccupiedArea.intersectsWith(board.area);
    }

    /**
     * moves the actor along a specified vector from its current position in 2Dspace
     * @param {Object} increment a vector representing the position to move to relative to the current position
     * @param {number} increment.x the horizontal increment of the vector in 2D space
     * @param {number} increment.y the vertical increment of the vector in 2D space
     * @returns {boolean} true if the actor moved, false if the move was not allowed
     */
    move(increment = { x: 0, y: 0 }) {
        if (!this.canMove({ x: increment.x, y: increment.y})) return false;
        this.position = this.position.offset(increment.x, increment.y);
        return true;
    }
}

/**
 * represents a prop on the board of the game
 * a prop is an entity that cannot act itself, e.g. move
 * a prop may interact with other entities, but not by its own initiative
 */
class Prop extends Entity {
    /**
     * @param {Object} param
     * @param {Board} param.board the board that the entity belongs to
     * @param {EntityVisual} param.visual the visual representation of the entity
     * @param {Point} param.position the position of the entity relative to its board
     * @param {number} param.zIndex the stack order of entities in the board, entities with a lower zIndex are painted before those with higher ones
     * @param {number} param.hitScoreIncrement the increment in the player score if hit by the player
     * @param {boolean} param.removeOnHit true if the prop is to be removed after being hit
     */
    constructor({ board, visual, position = new Point(0, 0), zIndex = 0, hitScoreIncrement = 0, removeOnHit = false}) {
        super({board: board, visual: visual, position: position, zIndex: zIndex, hitScoreIncrement: hitScoreIncrement, removeOnHit: removeOnHit});
    }
}

/**
 * represents a diamond on the board of the game 
 * diamonds are instantiated with a predefined visual and zIndex
 */
class Diamond extends Prop {
    /**
     * @param {Object} param
     * @param {Board} param.board the board that the entity belongs to
     * @param {Point} param.position the position of the entity relative to its board
     * @param {number} param.hitScoreIncrement the increment in the player score if hit by the player
     */
    constructor({ board, position = new Point(0, 0), hitScoreIncrement = 1}) {
        //a predefined visual is used for diamonds in this game
        const visual = new EntityVisual({ sprite: "images/diamond.png", occupiedArea: new Area(new Point(3, 100), new Dimensions(95, 62)) });
        //a predefined zIndex is used for different types of entities in this game, so that they are painted in an appropriate order
        //dimaonds are removed after being hit
        super({ board: board, visual: visual, position: position, zIndex: 101, hitScoreIncrement: hitScoreIncrement, removeOnHit: true});
    }
}

/**
 * represents an enemy on the board of the game
 * enemies are instantiated with a predefined visual and zIndex and are allowed to move outside the board
 */
class Enemy extends Actor {
    /**
     * @param {Object} param
     * @param {Board} param.board the board that the entity belongs to
     * @param {number} param.hitScoreIncrement the increment in the player score if hit by the player
     * @param {boolean} param.removeOnHit true if the enemy is to be removed after being hit
     * @param {Object} param.moveIncrement a vector representing the direction and speed of an enemy move on the board
     * @param {number} param.moveIncrement.x the horizontal increment of the increment vector in 2D space
     * @param {number} param.moveIncrement.y the vertical increment of the increment vector in 2D space
     */
    constructor({board, hitScoreIncrement = -2, removeOnHit = false, moveIncrement = {x: 20, y: 0}}) {
        const visual = new EntityVisual({sprite: moveIncrement.x >= 0 ? "images/enemy-right.png" : "images/enemy-left.png",
                                         dimensions: board.grid.cellVisualTemplate.dimensions.clone(),
                                         occupiedArea: new Area(new Point(2, 102), new Dimensions(96, 42))});
        super({ board: board, visual: visual, zIndex: 200, hitScoreIncrement: hitScoreIncrement, removeOnHit: removeOnHit, canMoveOutsideBoard: true});
        /**
         * @description a vector representing the direction and speed of an enemy move on the board
         * @type {{x: number, y: number}}
         */
        this.moveIncrement = moveIncrement;
        /**
         * @description a boolean indicating whether the enemy is to be respawned on next update
         * @type {boolean}
         */
        this.respawnOnNextUpdate = false;
    }    

    /**
     * moves the enemy based on its set move increment, i.e. speed and direction, and provided delta time
     * @param {number} dt the delta time calculated for the computing environment
     */
    update(dt) {
        const increment = {x: this.moveIncrement.x * dt, y: this.moveIncrement.y * dt};
        this.move(increment)
        //inactivated if completely outside the board
        this.respawnOnNextUpdate = !this.someOnTheBoard;
    }
}

/**
 * represents a player on the board of the game
 * players are instantiated with a predefined visual and zIndex and are not allowed to move outside the board
 */
class Player extends Actor {
    /**
     * @param {Object} param 
     * @param {Board} param.board the board that the entity belongs to
     */
    constructor(board) {
        const visual = new EntityVisual({sprite: "images/player.png", occupiedArea: new Area(new Point(34, 120), new Dimensions(34, 20))});
        super({board: board, visual: visual, zIndex: 300, hitScoreIncrement: 0, removeOnHit: false, canMoveOutsideBoard: false});
        /**
         * @description the position of the player in the board grid.
         *      the position is defined by the board on initialization.
         * @type {GridPosition}
         * @private
         */
        this._gridPosition = board.playerStartPosition;
        /**
         * @description the score of the player
         * @type {number}
         * @private
         */
        this.score = 0;
        //move the player to its position in the grid
        this.moveToCell(this._gridPosition.row, this._gridPosition.column);
    }

    /**
     * @returns {Position} the position of the entity relative to its board
     */
    get position() {
        return this._position;
    }

    /**
     * @param {Position} position the position of the entity relative to its board
     */
    set position(position) {
        throw new Error('player entities are not allowed to move freely');
    }

    /**
     * overrides inherited canMove method and prevents use, as a player cannot move freely on the board,
     * but needs to move from cell to cell in the grid
     * @param {Object} increment a vector representing the position to move to relative to the current position
     * @param {number} increment.x the horizontal increment of the vector in 2D space
     * @param {number} increment.y the vertical increment of the vector in 2D space
     * @returns {boolean} true if the actor is allowed to the position specified by the increment vector
     */
    canMove(increment = { x: 0, y: 0 }) {
        throw new Error('player entities are not allowed to move freely, use canMoveInGrid instead');
    }

    /**
     * overrides inherited move method and prevents use, as a player cannot move freely on the board,
     * but needs to move from cell to cell in the grid
     * @param {Object} increment a vector representing the position to move to relative to the current position
     * @param {number} increment.x the horizontal increment of the vector in 2D space
     * @param {number} increment.y the vertical increment of the vector in 2D space
     * @returns {boolean} true if the actor moved, false if the move was not allowed
     */
    move(increment = { x: 0, y: 0 }, dt) {
        throw new Error('player entities are not allowed to move freely, use moveInGrid instead');
    }

    /**
     * returns a boolean indicating whether a actor is allowed to move in the direction specified in the board grid.
     * @param {string} direction the direction to move the player in
     * @returns {boolean} true if the player is allowed to move in the direction specified
     */
    canMoveInGrid(direction) {
        switch (direction) {
            case "left":
                return this._board.grid.hasCell(this._gridPosition.row, this._gridPosition.column-1);
            case "up":
                return this._board.grid.hasCell(this._gridPosition.row - 1, this._gridPosition.column);
            case "right":
                return this._board.grid.hasCell(this._gridPosition.row, this._gridPosition.column + 1);
            case "down":
                return this._board.grid.hasCell(this._gridPosition.row + 1, this._gridPosition.column);
            default:
                return false;
        }
    }

    /**
     * moves the player in the direction specified in the board grid.     
     * @param {string} direction the direction to move the player in
     * @returns {boolean} true if the player moved, false if the move was not allowed
     */
    moveInGrid(direction){
        if (!this.canMoveInGrid(direction)) return false;
        switch (direction) {
            case "left":
                this._gridPosition.column--;
                break;
            case "up":
                this._gridPosition.row--;
                break;
            case "right":
                this._gridPosition.column++;
                break;
            case "down":
                this._gridPosition.row++;
                break;
            default:
                throw new Error("unsupported direction");
        }
        this.moveToCell(this._gridPosition.row, this._gridPosition.column);
        return true;
    }

    /**
     * @returns {BoardGridCell} the cell that the players in positioned on
     */
    get occupiedCell() {
        return this._board.grid.getCell(this._gridPosition.row, this._gridPosition.column);
    }

    /**
     * leaves a blood prop on the cell the player is positioned on.
     * used to indicate where on the board grid the player was hit (killed) by the enemy.
     * @param {number} direction a number indicating a horizontal direction and speed.
     * numbers >= 0 are left to right, negative numbers are right to left.
     */
    bleed(direction) {
        const visual = new EntityVisual({ 
            sprite: direction >= 0 ? "images/blood-right.png" : "images/blood-left.png", 
            dimensions: this._board.grid.cellVisualTemplate.dimensions});
        const blood = new Prop({ 
            board: this._board, 
            visual: visual,
            position: this._position.clone(), 
            zIndex: 100 });
        this._board.nonPlayerEntities.push(blood);
    }
}

/**
 * represents a position in a two dimensional grid
 */
class GridPosition {
    /**
     * @param {number} row the zero-based index of the grid row
     * @param {number} column the zero-based index of the grid column
     */
    constructor(row = 0, column = 0) {
        /**
         * @description the zero-based index of the grid row
         * @type {number}
         */
        this.row = row;
        /**
         * @description the zero-based index of the grid column
         * @type {number}
         */
        this.column = column;
    }
}

/**
 * represents a cell in the board grid
 * board grid cells are instantiated with a predefined zIndex
 */
class BoardGridCell extends Prop {
    /**
     * @param {Object} param
     * @param {BoardGrid} param.grid the board grid that the cell belongs to
     * @param {string} param.type the type of cell to create
     * @param {Point} param.gridPosition the position the cell in its board grid
     * @param {number} param.zIndex the stack order on the board, entities with a lower zIndex are painted before those with higher ones     
     */
    constructor({grid, type, gridPosition = new GridPosition(0,0), zIndex = 0}) {
        //creates the visual of the cell based on the provided type
        const visual = new EntityVisual({ sprite: BoardGridCell.typeToSprite(type), occupiedArea: new Area(new Point(0, 52), new Dimensions(101, 83)) });
        const hitScoreIncrement = type === "water" ? 2 : 0;
        super({ board: grid.board, visual: visual, zIndex: zIndex, hitScoreIncrement: hitScoreIncrement, removeOnHit: false});
        /**
         * @description the type of the cell, e.g. road, water, grass, etc.
         *      protected as the visual corresponds to the type
         * @type {string}
         * @protected
         */
        this._type = type;
        /**
         * @description the type of the cell, e.g. road, water, grass, etc.
         *      protected as the visual corresponds to the type
         * @type {string}
         * @protected
         */
        this._grid = grid;
        /**
         * @description the position the cell in its board grid
         * @type {GridPosition}
         * @protected
         */        
        this._gridPosition = gridPosition;
        //place cell in board grid
        this._position = grid.calculateCellPosition(gridPosition.row, gridPosition.column);
    }

    /**
     * positions the cell in the grid at the grid position specified
     * @param {number} row 
     * @param {number} column 
     */
    placeInGrid(row, column) {
        this._gridPosition = new GridPosition(row, column);
        this._position = this._grid.calculateCellPosition(row, column);
    }

    /**
     * @returns {string} the type of cell
     */
    get type() {
        return this._type;
    }

    /**
     * @returns {grid} the grid that the cell belongs to
     */
    get grid() {
        return this._grid;
    }   

    /**
     * @returns {number} the zero-based index of the grid row in which the cell is positioned
     */
    get row() {
        return this._gridPosition.row;
    }

    /**
     * @returns {number} the zero-based index of the grid column in which the cell is positioned
     */
    get column() {
        return this._gridPosition.column;
    }

    /**
     * get the image to be used for the cell based on the specified type
     * @param {string} type the cell type to get a corresponding image for
     * @returns {string} a path to the image corresponding to the specified cell type
     */
    static typeToSprite(type) {
        switch (type) {
            case "grass":
                return "images/grass.png";
            case "road":
                return "images/road.png";
            case "water":
                return "images/water.png";
            default:
                throw new Error(`type '${type}' not supported`);
        }   
    }
}

/**
 * represents a the grid of a board
 */
class BoardGrid {
    /**
     * @param {Object} param
     * @param {Board} param.board the board that the grid belongs to
     * @param {number} param.numberOfColumns the number of columns in the grid
     * @param {string[]} param.rowTypes an array containing the type of cell each row is to be populated with.
     *      the array index represent the row index in the grid, and the length of the array represents the number of rows that
     *      the grid is to be created with
     * @param {EntityVisual} cellVisualTemplate the entity visual representing the dimensional specifications, i.e. dimensions and occupied area, applying to all cells
     */
    constructor({ board, numberOfColumns = 7, rowTypes = ["water", "road", "road", "road", "road", "road", "grass", "grass"], cellVisualTemplate} = {}){        
        /**
         * @description the number of columns of the grid
         * @type {number}
         * @protected
         */
        this._numberOfColumns = numberOfColumns;
        /**
         * @description an array containing the type of cell of each row in the grid
         * @type {string[]}
         * @protected
         */
        this._rowTypes = rowTypes;
        /**
         * @description an array of arrays representing the rows and within, columns, of the grid. 
         *      it is the container of grid cells. 
         * @example to reference the cell at row 1 and column 2: this._rows[0][1] 
         * @type {BoardGridCell[BoardGridCell[]]}
         * @protected
         */
        this._rows = new Array(rowTypes.length).fill(null).map(() => new Array(numberOfColumns).fill(null));
        /**
         * @description the board that the grid belongs to
         * @type {Board}
         * @protected
         */
        this._board = board;
        /**
         * @description the entity visual representing the dimensional specifications, i.e. dimensions and occupied area, applying to all cells
         * @type {EntityVisual}
         * @protected
         */
        this._cellVisualTemplate = cellVisualTemplate;
        /**
         * @description the total area of the grid
         * @type {Area}
         * @protected
         */        
        this._area = new Area(new Point(0, 0), new Dimensions(ctx.canvas.width, ctx.canvas.height));
        /**
         * @description the total occupied area of the grid
         * @type {Area}
         * @protected
         */
        this._occupiedArea = new Area(cellVisualTemplate.occupiedArea.position.clone(), new Dimensions(cellVisualTemplate.occupiedArea.width * this.numberOfColumns, cellVisualTemplate.occupiedArea.height * this.numberOfRows))
        
        //populate grid with cells
        this._cells = [];
        let zIndex = 0;
        for (let rowIndex = 0; rowIndex < rowTypes.length; rowIndex++) {
            const type = rowTypes[rowIndex];
            zIndex += rowIndex;
            for (let columnIndex = 0; columnIndex < numberOfColumns; columnIndex++) {
                let cell = new BoardGridCell({grid: this, type: type, zIndex: zIndex});
                this.setCell(cell, rowIndex, columnIndex);
                //also save reference to cell in an array to make operations on the entire set of cells a bit more convenient
                this._cells.push(cell);
            }
        }
    }

    /**
     * @returns {EntityVisual} the entity visual representing the dimensional specifications, i.e. dimensions and occupied area, applying to all cells
     */
    get cellVisualTemplate() {
        return this._cellVisualTemplate;
    }

    /**
     * @returns {Area} the total area of the grid
     */
    get area() {
        return this._area;
    }

    /**
     * @returns {Area} the total occupied area of the grid
     */
    get occupiedArea(){
        return this._occupiedArea;
    }

    /**
     * @returns {BoardGridCell[]} an array containing all the cells of the grid 
     */
    get cells() {
        return this._cells;
    }

    /**
     * @returns {Board} the board that the grid belongs to
     */
    get board() {
        return this._board;
    }

    /**
     * @returns {number} the number of rows in the grid
     */
    get numberOfRows() {
        return this._rowTypes.length;
    }

    /**
     * @returns {number} the number of columns in the grid
     */
    get numberOfColumns() {
        return this._numberOfColumns;
    }    

    /**
     * assigns a cell to a specified position in the grid
     * @param {BoardGridCell} cell the cell to assign to a position in the grid
     * @param {number} row the zero-based index of the row to assign the cell to
     * @param {number} column the zero-based index of the column to assign the cell to
     */
    setCell(cell, row, column){
        cell.placeInGrid(row, column);
        this._rows[row][column] = cell;
    }

    /**
     * gets the cell at the specified position in the grid
     * @param {number} row the zero-based index of the row containing the cell
     * @param {number} column the zero-based index of the column containing the cell
     * @returns {BoardGridCell} the cell at the specified position in the grid
     */
    getCell(row, column) {
        return this._rows[row][column];
    }

    /**
     * returns a boolean indicating whether a specified grid position exists.
     * @param {number} row the zero-based index of the row in the grid
     * @param {number} column the zero-based index of the column in the grid
     * @returns {boolean} true if the specified grid position exists
     */
    hasCell(row, column) {
        return row >= 0 && 
               row < this.numberOfRows && 
               column >= 0 &&
               column < this.numberOfColumns;
    }
    
    /**
     * @returns {BoardGridCell[BoardGridCell[]]} an array of arrays representing the rows and within, columns, of the grid.
     */
    get rows() {
        return this._rows;
    }

    /**
     * @returns an array containing the type of cell each row is containing
     */
    get rowTypes() {
        return this._rows.map(row => row[0].type);
    }
    
    /**
     * calculates the position (top left corner) of a specified cell in the grid
     * @param {row} row the zero-based index of the row in the grid
     * @param {number} column the zero-based index of the column in the grid
     * @returns {Point} the position (top left corner) of a specified cell in the grid
     */
    calculateCellPosition(row, column) {  
        //cell dimensions equal the size of the occupied area of the visual template
        //this enables the very specific stacking requirement of the current 3Dish visual representation of the board
        const cellOccupiedAreaDimensions = this._board.cellVisualTemplate.occupiedArea.dimensions;
        return new Point(column * cellOccupiedAreaDimensions.width, row * cellOccupiedAreaDimensions.height);
    }
}

/**
 * represents the game board
 */
class Board {
    /**     
     * @param {Object} param 
     * @param {number} param.numberOfColumns the number of columns in the board's grid
     * @param {string[]} param.rowTypes an array containing the type of cell each row of the board's grid is to be populated with.
     *      the array index represent the row index in the grid, and the length of the array represents the number of rows that
     *      the grid is to be created with
     * @param {number} param.numberOfEnemies the number of enemies that should be moving on the board at all times
     * @param {number} param.numberOfDiamonds the number of diamons to be placed on the board
     * @param {{min: number, max: number}} param.enemyIncrementRange the range of enemy speed new enemies can be spawned having
     * @param {EntityVisual} param.cellVisualTemplate the entity visual representing the dimensional specifications, i.e. dimensions and occupied area, applying to all cells
     */
    constructor({numberOfColumns = 7, 
                 rowTypes = ["water", "road", "road", "road", "road", "road", "grass", "grass"], 
                 numberOfEnemies = 10, 
                 numberOfDiamonds = 1,
                 enemyIncrementRange = {min: 20, max: 200},
                 cellVisualTemplate} = {}) {        
        /**
         * @description the number of enemies that should be moving on the board at all times
         * @type {number}
         */
        this.numberOfEnemies = numberOfEnemies;
        /**
         * @description the number of diamonds to be placed on the board on initialization
         * @type {number}
         */
        this.numberOfDiamonds = numberOfDiamonds;
        /**
         * @description the range of enemy speed new enemies can be spawned having
         * @type {min: number, max: number}
         */
        this.enemyIncrementRange = enemyIncrementRange;
        /**
         * @description the entity visual representing the dimensional specifications, i.e. dimensions and occupied area, applying to all cells
         * @type {EntityVisual}
         * @protected
         */
        this._cellVisualTemplate = cellVisualTemplate;
        /**
         * @description the grid of the board
         * @type {BoardGrid}
         * @protected
         */
        this._grid = new BoardGrid({board: this, numberOfColumns: numberOfColumns, rowTypes: rowTypes, cellVisualTemplate: cellVisualTemplate});
        /**
         * @description an array containg all entities except the player currently on the board
         * @type {Entity[]}
         */
        this.nonPlayerEntities = [...this._grid.cells];
        //add entities to the board
        this.placeDiamonds();
        this.player = new Player(this);
        this.respawnEnemies();
    }

    /**
     * places the set amount of diamonds on the board
     * It will rmeove any existing diamonds before placing new ones
     */
    placeDiamonds() {        
        //delete existing diamonds
        this.nonPlayerEntities.forEach(function (entity) { if (entity instanceof Diamond) this.entity.delete(prop)});
        //get cells where diamonds can be placed
        const roadCells = this._grid.cells.filter(cell => cell.type === "road");
        if (this.numberOfDiamonds > roadCells.length) throw new Error("not enough space on board to place all diamonds")

        const indices = new Set();
        while(indices.size < this.numberOfDiamonds){
            let index = randBetween(0, roadCells.length);
            //avoid placing two diamonds in the same cell
            if(!indices.has(index)){
                let cell = roadCells[index];
                let diamond = new Diamond({ board: this, position: cell.position.clone(), hitScoreIncrement: 1});
                diamond.moveToCell(cell.row, cell.column);
                this.nonPlayerEntities.push(diamond);
                indices.add(index);
            }
        }
    }

    /**
     * @returns {BoardGrid} the grid of the board
     */
    get grid() {
        return this._grid;
    }

    /**
     * @returns {EntityVisual} the entity visual representing the dimensional specifications, i.e. dimensions and occupied area, applying to all cells
     */
    get cellVisualTemplate() {
        return this._cellVisualTemplate;
    }

    /**
     * respawns the player at the default starting position on the board grid
     * @param {boolean} keepScore true if the current score should be passed to the new Player instance
     */
    respawnPlayer(keepScore) {
        const score = this.player.score;
        this.player = new Player(this);
        if (keepScore) this.player.score = score;
    }

    /**
     * respawns all enemies 
     */
    respawnEnemies() {
        //remove all existing enemies
        this.nonPlayerEntities = this.nonPlayerEntities.filter(entity => !(entity instanceof Enemy));
        //create new ones
        for (let index = 0; index < this.numberOfEnemies; index++) {
            this.spawnEnemy();
        } 
    }

    /**
     * spawns an enemy on the board on a randomly selected road row (just outside the board) 
     * with a randomly selected speed and random move direction
     */
    spawnEnemy() {
        //determine move direction
        const direction = randBetween(0,1) === 1 ? 1 : -1;
        //select a cell from each road row
        const roadRowIndices = this._grid.rowTypes.map((row, index) => { return row === "road" ? index : -1 }).filter(index => index != -1)
        //randomly select one of the cells
        const roadIndex = randBetween(0, roadRowIndices.length-1);
        const cellRowIndex = roadRowIndices[roadIndex];
        const cellColumnIndex = direction === 1 ? 0 : this._grid.numberOfColumns-1;
        //create an enemy with a random speed within the range specified by this.enemyIncrementRange
        const enemy = new Enemy({board: this, 
                               hitScoreIncrement: -2,
                               removeOnHit: false,
                               moveIncrement: {x: randBetween(direction * this.enemyIncrementRange.min, direction * this.enemyIncrementRange.max), y: 0}});
        //place in randomly selected first column road cell 
        enemy.moveToCell(cellRowIndex, cellColumnIndex);
        //move enemy just visually outside the board to give the impression that its moving into the board from outside
        if(direction === 1) {
            enemy.position = enemy.position.offset(-1 * (enemy.area.width - (enemy.area.topRight.x - enemy.occupiedArea.topRight.x)), 0);
        }
        else {
            enemy.position = enemy.position.offset((enemy.area.width - (enemy.area.topLeft.x - enemy.occupiedArea.topLeft.x)), 0);
        }
        
        //add to enemies collection
        this.nonPlayerEntities.push(enemy);
    }    
    
    /**
     * @returns {GridPosition} returns the default player start position in the board grid based on the size of the board grid
     */
    get playerStartPosition() {
        return new GridPosition(this.grid.numberOfRows - 1, Math.ceil((this.grid.numberOfColumns-1) / 2));
    }

    /**
     * renders the player score on predefined area in the top left of the game area just above the occupied area of the first row of cells
     */
    renderScore() {
        ctx.font = "30px arial";
        ctx.fillStyle = "black";
        ctx.fillText(`SCORE: ${this.player.score}`, 0, 40);
    }
    
    /**
     * renders the board, entities, and the player score
     */
    render() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        [...this.nonPlayerEntities, this.player].sort((a,b) => (a.zIndex > b.zIndex ? 1 : -1)).forEach(e => e.render());
        this.renderScore();
    }

    /**
     * updates player positions and checks for and manages interaction events between entities
     * @param {number} dt the delta time calculated for the computing environment
     */
    update(dt) {
        //iterating backwards as we may be removing entities and hence altering the length of the array
        for (let index = this.nonPlayerEntities.length - 1; index >= 0; index--) {
            let entity = this.nonPlayerEntities[index];
            //take action for entities touching the player
            if (this.player.touches(entity)) {
                //increment player score by increment set on the touching entity
                this.player.score += entity.hitScoreIncrement;
                //remove entities set to be removed on touch with the player
                if(entity.removeOnHit) {
                    this.nonPlayerEntities.splice(index, 1);
                }
                //kill the player on enemy contact
                if(entity instanceof Enemy) {
                    //enemy direction determines blood sprite to use
                    this.player.bleed(entity.moveIncrement.x);
                    this.respawnPlayer(true);
                } 
                //respawn player on water contact. note that score increment is done in generalized fashion above
                if(entity instanceof BoardGridCell && entity.type === "water") this.respawnPlayer(true);
            }
            //replace enemies that have moved outside the board with new ones
            if(entity instanceof Enemy) {
                entity.update(dt);
                if(entity.respawnOnNextUpdate) {
                    this.nonPlayerEntities.splice(index, 1);
                    this.spawnEnemy();
                }
            }
         }
    }
}

/**
 * returns a random integer within a specified range
 * @param {number} min the lower bound of the range of possible values
 * @param {number} max the upper bound of the range of possible values
 * @returns {number} a random integer within a specified range
 */
function randBetween(min = 0, max = 1) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}