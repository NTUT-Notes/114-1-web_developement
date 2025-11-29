var mainGame;

// Main element that won't be dispose while state switch
var background, capybara, sun;

const GAME_WIDTH = 480;
const GAME_HEIGHT = 480;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function easeInOut(t) {
    return t * t * (3.0 - 2.0 * t);
}

var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

class GameState {
    setup() {
        throw new "Setup function not implemented!";
    }

    setup() {
        throw new "Dispose function not implemented!";
    }
}

class IntroState extends GameState {
    setup() {
        mainGame.state = "Ready";

        // Remove ring from the capybara
        capybara.children = [];

        this.grass = new ImageShape(
            0, 480, 498, 148, "./assets/image/grass.png" 
        );

        this.title = new GameTitle(135, 500);

        this.startGameTitle = new TextBox({
            x: 135, 
            y: 500, 
            color: "white", 
            text: "< Click to start >"
        });

        this.startGameTitle.size = 18

        mainGame.addComponent(this.grass);
        
        mainGame.addComponent(this.title);
        mainGame.addComponent(this.startGameTitle);

        mainGame.onDraw = (frame) => {
            this.onDraw(frame);
        };        
    }

    dispose() {
        mainGame.canvas.removeEventListener('click', IntroState._onMouseClick);
    }

    onDraw(frame) {
        this._drawIntroUnclicked(frame);
    }

    static _onMouseClick() {
        mainGame.canvas.removeEventListener('click', IntroState._onMouseClick);

        mainGame.onDraw = () => {};
        
        capybara.unmove = false;
        // Apply fall down effect to all object
        for (var i=0; i<mainGame.children.length; i++) {
            if (mainGame.children[i].unmove == true) {
                continue;
            }
            mainGame.children[i].gravitySpeed = 3;
        }

        mainGame.frameNo = 0;
        mainGame.score = 0;
        mainGame.health = 3;

        var gameplay = new GameplayState();
        gameplay.setup();
    }

    _drawCapybaraMove(subFrame) {
        var maxHeight = (capybara.x >= 60 && capybara.x <= 350) ? 280 : 230;
        
        if (subFrame == 0) {
            capybara.x = 400 * Math.random();
        }

        if (subFrame <= 100) {
            var keyframe = subFrame / 100;
            capybara.y = maxHeight + 150 * (1-easeInOut(keyframe));
        } else if (subFrame <= 200) {

        } else {
            var keyframe = (subFrame-200) / 100;
            capybara.y = maxHeight + 150 * (easeInOut(keyframe));
        }
    }

    _drawGrassFloatUp(subFrame) {
        var keyframe = subFrame / 50;
        this.grass.y = 480-148 + 148 * (1-easeInOut(keyframe));
    }

    _drawTitleSlideIn(subFrame) {
        var keyframe = (subFrame-25) / 50;
        this.title.y = -80 + 290 * easeInOut(keyframe);
    }

    _drawTitleWave(subFrame) {
        if (subFrame > 50) {
            var keyframe = (subFrame-50) / 50;
            this.title.y = -80 + 290 - 10 * (1-easeInOut(keyframe));
            this.title.scale = 1.0 - 0.2 * (1-easeInOut(keyframe));
            
        } else {
            var keyframe = subFrame / 50;
            this.title.y = -80 + 290 - 10 * (easeInOut(keyframe));
            this.title.scale = 0.8 + 0.2 * (1-easeInOut(keyframe));
        }
    }

    _drawFlickerPressKeyToStart(subFrame) {
        if (subFrame == 0) {
            this.startGameTitle.y = 465;
        }

        if (subFrame == 50) {
            this.startGameTitle.y = 500;
        }

    }

    _drawAddCloud() {
        var size = Math.random() * 0.1 + 0.6;
        var yPos = 30 + Math.random() * 20;
        var cloud = new Cloud(479, yPos, size);
        cloud.speedY = 0;
        cloud.speedX = -1 + Math.random() * -2;

        mainGame.addComponent(cloud);
    }

    _drawAddElephantShrew() {
        const baseY = 380;

        var direction = Math.random() - 0.5 > 0 ? 1: -1;

        var size = 0.1 + Math.random() * 0.05;

        var elephantShrew = new ElephantShrew(
            direction > 0 ? -100 : 480,
            baseY-30*Math.random(),
            size
        );

        elephantShrew.speedX = (1+Math.random()) * direction;
        mainGame.addComponent(elephantShrew);
    }

    _drawIntroUnclicked(frame) {
        if (frame <= 50) {
            this._drawGrassFloatUp(frame);
        }

        if (frame >= 50) {
            this._drawCapybaraMove((frame-50) % 300);
        }

        if (frame >= 25 && frame <= 75) {
            this._drawTitleSlideIn(frame);
        }

        if (frame > 75) {
            this._drawTitleWave((frame-75) % 100);            
        }

        if (frame % 120 == 0) {
            this._drawAddCloud();
        }

        if (frame > 75) {
            this._drawFlickerPressKeyToStart((frame - 75) % 100);
        }

        if (frame == 80) {
            mainGame.canvas.addEventListener('click', IntroState._onMouseClick);
        }

        if (frame % 150 == 0) {
            this._drawAddElephantShrew();
        }
    }

}

class GameplayState extends GameState {
    constructor() {
        super();
        this.inputController = new InputController();
    }

    setup() {
        mainGame.state = "Gameplay";

        this.scoreIndicator = new ScoreIndicator(30, -40);

        mainGame.addComponent(this.scoreIndicator);

        mainGame.onDraw = (frame) => {
            this.onDraw(frame);
        };

        document.addEventListener('keydown', (e) => {
            this._addEventCapybaraKeyDown(e);
        });
        document.addEventListener('keyup', (e) => {
            this._addEventCapybaraKeyUp(e);
        });
    }

    dispose() {
        document.removeEventListener('keydown', (e) => {
            this._addEventCapybaraKeyUp(e);
        });

        document.removeEventListener('keyup', (e) => {
            this._addEventCapybaraKeyDown(e);
        });

        mainGame.canvas.removeEventListener('click', GameplayState._addEventCapabaraAttack)
    }

    static _addEventCapabaraAttack(event) {
        capybara.attack();
    }

    _addEventCapybaraKeyDown(event) {
        this.inputController.onKeyDownEvent(event);
    }

    _addEventCapybaraKeyUp(event) {
        this.inputController.onKeyUpEvent(event);
    }

    onDraw(frame) {
        // Switch to end game state when life went to zero
        if (this.scoreIndicator.health == 0) {
            this._stateSwitchToGameOver();
        }

        if (frame % 20 == 0) {
            this._drawAddCloud();
        }

        if (frame < 80) {
            this.scoreIndicator.speedY = 1;

            if (this.scoreIndicator.y > 5) {
                this.scoreIndicator.speedY = 0;
            }
        }

        if (frame >= 80) {
            const [hor, ver] = this.inputController.getDirections();
            capybara.applyMove(hor, ver);

            if (this.inputController.getAttack()) {
                capybara.attack();
            }
        }

        if (frame == 150) {
            mainGame.canvas.addEventListener('click', GameplayState._addEventCapabaraAttack);
        }
        
        if (frame >= 80 && frame < 230) {
            var keyframe = (frame-80) / 150;
            
            capybara.x = capybara.x + (220 - capybara.x) / 2;
            capybara.y = 480 - 120 * easeInOut(keyframe);

            capybara.scale = 1.0 - 0.5 * easeInOut(keyframe);
            capybara.gravitySpeed = 0;
            return;
        } else if (frame == 230) {
            capybara.ensureInBound = true;
        }
        
        if (frame >= 80 && frame % 50 == 0) {
            this._drawAddEagle();
        }
    }

    _drawAddCloud() {
        var count = Math.round( Math.random() * 3 );
        for (var i=0; i<count; i++) {
            var randX = GAME_WIDTH * Math.random();
            var size = 0.3 + Math.random() * 0.2;
            
            mainGame.addComponent(new Cloud(randX, -100, size), 1);
        }
    }

    _drawAddEagle() {
        var capybaraSpeed = 2 + mainGame.frameNo / 50 * 0.2;
        capybaraSpeed = capybaraSpeed>12 ? 12 : capybaraSpeed;
        
        var eagleSpeed = capybaraSpeed - 3 + 3 * Math.random();
        
        var scale = 0.4 + Math.random() * 0.1;
        var maxWidth = mainGame.canvas.width - 198 * scale;

        var x = Math.random() * maxWidth;

        var eagle = new Eagle(x, -50, scale);
        eagle.speedY = eagleSpeed;
        capybara.speed = capybaraSpeed;

        mainGame.addComponent(eagle)
    }

    _stateSwitchToGameOver() {
        mainGame.onDraw = () => {};
        this.dispose();

        capybara.unmove = true;
        capybara.makeStandStill();

        // Add ring to capybara when dead
        capybara.children = [capybara.ring];
        
        // Apply fall down effect to all object
        for (var i=0; i<mainGame.children.length; i++) {
            if (mainGame.children[i].unmove == true) {
                continue;
            }
            mainGame.children[i].gravitySpeed = 7;
        }

        this.scoreIndicator.gravitySpeed = 0;
        this.scoreIndicator.speedY = -0.5;
        this.scoreIndicator.disposed = true;

        mainGame.frameNo = 0;

        var gameover = new GameOverState();
        gameover.setup();
    }
}

class GameOverState extends GameState {
    setup() {
        mainGame.state = "Game Over";

        this.scoreIndicator = new ScoreSummarize(60, 480);

        if (mainGame.score >= 600) {
            this.scoreIndicator.setScore({
                rating: "S",
                description: "Rating: Out of the park",
                color: "gold"
            });
        } else if (mainGame.score >= 500){
            this.scoreIndicator.setScore({
                rating: "A",
                description: "Rating: Excellent",
                color: "green"
            });
        } else if (mainGame.score >= 400) {
            this.scoreIndicator.setScore({
                rating: "B",
                description: "Rating: Acceptable",
                color: "blue"
            });
        } else if (mainGame.score >= 200) {
            this.scoreIndicator.setScore({
                rating: "C",
                description: "Rating: Moderate",
                color: "purple"
            });
        } else {
            this.scoreIndicator.setScore({
                rating: "D",
                description: "Rating: Wasted",
                color: "red"
            });
        }


        this.scoreIndicator.speedY = -4;

        mainGame.addComponent(this.scoreIndicator);

        this.gameText = new TextBox({
            x: -480,
            y: 170,
            color: "white",
            text: "Game",
            size: 60
        });

        this.overText = new TextBox({
            x: -480,
            y: 240,
            color: "white",
            text: "Over",
            size: 60
        });

        this.restartText = new TextBox({
            x: 67,
            y: 500,
            color: "black",
            text: "< Click to restart the game >",
            size: 18
        });

        mainGame.addComponent(this.gameText);
        mainGame.addComponent(this.overText);
        mainGame.addComponent(this.restartText);

        mainGame.onDraw = (frame) => {
            this.onDraw(frame);
        };
    }

    onDraw(frame) {
        if (this.scoreIndicator.y < 270) {
            this.scoreIndicator.speedY = 0;
        }

        if (frame < 200) {
            const endX = 270;
            const endY = 70;

            capybara.x = capybara.x + (endX - capybara.x) / 50;
            capybara.y = capybara.y + (endY - capybara.y) / 50;
            capybara.scale += (1.5 - capybara.scale) / 50;
        }

        if (frame >= 200) {
            var subFrame = (frame-200) % 100;
            
            if (subFrame > 50) {
                this.restartText.y = 370;
            } else {
                this.restartText.y = 500;
            }
        }

        if (frame == 200) {
            this.scoreIndicator.disposed = true;
        }

        if (frame < 50) {
            var keyframe = frame / 50;
            this.gameText.x = -170 + (70 + 170) * easeInOut(keyframe);
            this.overText.x = -170 + (90 + 170) * easeInOut(keyframe);
        }

        if (frame % 20 == 0) {
            this._drawAddCloud();
        }

        if (frame == 100) {
            mainGame.canvas.addEventListener('click', GameOverState._onMouseClick);
        }
    }

    _drawAddCloud() {
        var size = Math.random() * 0.1 + 0.6;
        var yPos = 400 + Math.random() * 20;
        var cloud = new Cloud(479, yPos, size);
        cloud.speedY = 0;
        cloud.speedX = -1 + Math.random() * -2;

        mainGame.addComponent(cloud);
    }

    static _onMouseClick() {
        mainGame.canvas.removeEventListener('click', GameOverState._onMouseClick);

        capybara.unmove = true;
        capybara.ensureInBound = false;

        mainGame.frameNo = 0;
        mainGame.onDraw = GameOverState._onDrawWaitSceneClear;

        // Apply fall down effect to all object
        for (var i=0; i<mainGame.children.length; i++) {
            if (mainGame.children[i].unmove == true) {
                continue;
            }
            mainGame.children[i].gravitySpeed = 7;
        }
    }

    static _onDrawWaitSceneClear(frame) {
        if (frame < 120) {
            capybara.y += (540-capybara.y) / 45;
        }

        if (frame == 120) {
            GameOverState._switchToIntroState();
        }
    }

    static _switchToIntroState() {
        mainGame.onDraw = () => {};
        var intro = new IntroState();
        mainGame.frameNo = 0;
        intro.setup();
    }
}

class OutOfTheParkGame extends GameController {
    constructor(id) {
        super(id);

        this.health = 3;
        this.score = 0;
    }

    pause() {
        this.tempState = this.state;
        this.state = "Paused";
        super.pause();
    }

    start() {
        if (this.tempState != undefined) {
            this.state = this.tempState;
            this.tempState = undefined;
        }

        super.start();
    }
}

function updateHtmlInfo() {
    var infoScores = document.getElementById("info_score");
    var infoLives = document.getElementById("info_lives");
    var infoSpeed = document.getElementById("info_speed");
    var infoState = document.getElementById("info_state");

    infoScores.innerText = mainGame.score;
    infoLives.innerText = mainGame.health < 0 ? 0 : mainGame.health;
    infoSpeed.innerText = (20 / mainGame.framerate).toFixed(2) + "x";
    
    var state = mainGame.state;

    if (state == "Ready" && mainGame.frameNo < 75) {
        state = "Opening";
    }
    
    infoState.innerText = state;
}

function main() {
    if (mainGame != undefined) {
        mainGame.dispose();
    }

    mainGame = new OutOfTheParkGame("main_game");

    // Setup main elements
    background = new Background(0, 0);
    capybara = new Capybara(480, 480, 1.0);
    sun = new ImageShape(
        370, 30, 80, 80, "./assets/image/sun.png"
    )

    // Setup unmovable element (e.g. background)
    background.unmove = true;
    sun.unmove = true;
    mainGame.addComponent(background);
    mainGame.addComponent(capybara);
    mainGame.addComponent(sun);
    
    var intro = new IntroState();

    intro.setup();

    mainGame.start();

    setInterval(updateHtmlInfo, 100);
}

window.onload = main;