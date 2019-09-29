# Classic Arcade Game

Implementation of a cross the road style game using object oriented JavaScript and HTML5 Canvas.
This site is the third project submission on the Udacity Front-End Developer Nanodegree.

Try it live here: [https://andreasrafn.github.io/ClassicArcadeGame/](https://andreasrafn.github.io/ClassicArcadeGame/)

The live demo version features a 9 x 9 grid, 15 enemies and a preset enemy speed range.
To generate the game with a different configuration, see [How To Configure](#how-to-configure).

## Prerequisites

An Internet Browser

## How To Clone & Run

To clone and run this application, you'll need [Git](https://git-scm.com) installed on your computer. From your command line, clone like this:

```bash
# Navigate to the directory you would like to clone to
$ cd "c:/a/folder/i/would/like/to/clone/to"

# Clone this repository
$ git clone https://github.com/AndreasRafn/ClassicArcadeGame.git
```

Run `index.html` from the repository directory you cloned to.

Alternatively simple download without Git and run `index.html`. 

## How To Configure

To configure the game, make changes to the following variables in the `init` function in the file `engine.js`.
The below values are the default ones used in the live demo. 

```javascript
//set game variables
//changing these variables can change the game feel and difficulty significantly

//the number of columns in the board grid
const numberOfColumns = 9;

//the rows represented by their type ("water", "road" or "grass")
//for best result the first row type should be "water", and preferably the last one "grass"
const rowTypes = ["water", "road", "road", "road", "road", "road", "road", "grass", "grass"];

//the number of enemies on the table at all times
const numberOfEnemies = 15;

//the number of diamonds placed on the table
const numberOfDiamonds = 3;

//the enemy speed range 
const enemyIncrementRange = { min: 50, max: 500 };
```
## How To Play

Use the arrow keys to move the player around the board without hitting any crossing bugs 🐞🐞🐞

Increase your score by: 
* Reaching the water + 2
* Picking up diamonds + 1

You score is decreased when:
* Getting hit by bugs - 2

## Built With

* [Visual Studio Code](https://code.visualstudio.com/) - The IDE used
* [VS Code Debugger for Chrome](https://github.com/Microsoft/vscode-chrome-debug) - The debugger used

## Authors

* **Andreas Rafn**  

## Acknowledgments

* Inspired by materials provided by the [Udacity Front-End Developer Nanodegree](https://eu.udacity.com/course/front-end-web-developer-nanodegree--nd001)
* The file `js/resources.js` is provided by Udacity and unchanged
* Initially the file `js/engine.js` was initially provided by Udacity, but have been changed heavily to support a more generative and object oriented approach