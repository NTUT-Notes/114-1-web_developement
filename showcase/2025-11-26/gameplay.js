class Capybara extends ImageShape {
    constructor(x, y, scale) {
        super(x, y, 85*scale, 160*scale, "./assets/image/capybara.png");

        this.speed = 4;

        this.inputController = new InputController();

        // When to start the invicible frame
        this.invincibleSinceFrame = 0;

        // Decide whether ensure it in bound
        this.ensureInBound = false;

        this._scale = scale;

        this.ring = new ImageShape(
            this.x, this.y,
            80*scale, 80*scale,
            "./assets/image/ring.png"
        );

        this.children = [this.ring];
    }

    start() {
        super.start();
        this.children = [];
    }

    set scale(val) {
        this.width = 85*val;
        this.height = 160*val;
        this.ring.width = 80*val;
        this.ring.height = 80*val;
        
        this._scale = val;
    }

    get scale() {
        return this._scale;
    }

    applyMove(horizontal, vertical) {

        this.speedX = this.speed * horizontal;
        this.speedY = this.speed * vertical;
    }

    newPos() {
        var frame = this.parent.frameNo;

        var tmpX = this.x;
        var tmpY = this.y;

        this.ring.x = this.x-5*this._scale;
        this.ring.y = this.y-40*this._scale;

        super.newPos();

        if (this.ensureInBound) {
            var hitResult = this.checkHitBound();

            if (hitResult == Bound.Top || hitResult == Bound.Bottom) {
                this.y = tmpY;
            }

            if (hitResult == Bound.Left || hitResult == Bound.Right) {
                this.x = tmpX;
            }

            if (!this.isInvincible && this.detectCollision()) {
                this.parent.health -= 1;
                this.invincibleSinceFrame = frame;
            }
        }
    }

    draw() {
        super.draw();
    }

    attack() {
        var beam = new Beams(this.x, this.y, 8, 24);
        mainGame.addComponent(beam);
    }

    detectCollision() {
        var components = this.parent.children;
        for (var i=components.length-1; i>=0; i--) {
            if (components[i] instanceof Eagle &&
                this.crashWith(components[i])
            ) {
                return true;
            }
        }

        return false;
    }

    makeStandStill() {
        this.speed = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.gravitySpeed = 0;
    }

    get isInvincible() {
        return this.parent.frameNo - this.invincibleSinceFrame < 60;
    }
}

class Beams extends Component {
    constructor(x, y, width, height) {
        super(x, y, 8, 24);
        
        this.type = "beam";

        this.upper = new Cube(x, y         , width, height/3*1, "#73C8D2");
        this.lower = new Cube(x, y+height/3, width, height/3*2, "#0046FF")

        this.speedY = -30;
        this.upper.speedY = this.speedY;
        this.lower.speedY = this.speedY;
    }

    start() {
        super.start();
        this.upper.parent = this.parent;
        this.lower.parent = this.parent;
    }

    newPos() {
        this.y += this.speedY;
        this.upper.newPos();
        this.lower.newPos();
        this.detectCollision();
    }

    draw() {
        this.upper.draw();
        this.lower.draw();
    }

    detectCollision() {
        var components = this.parent.children;
        for (var i=components.length-1; i>=0; i--) {
            if (components[i] instanceof Eagle &&
                ! components[i].isDead &&
                this.crashWith(components[i])
            ) {
                components[i].passOut();
            }
        }
    }

    isDisposed() {
        return this.checkVisible();
    }
    
}

class Background extends Component {
    constructor() {
        super(0, 0, GAME_WIDTH, GAME_HEIGHT)
    }

    start() {
        this.ctx = this.parent.canvas.getContext("2d");

        // Horizontal gradient from (0,0) to (200,0)
        this.linearGradient = this.ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y+this.height
        ); 

        // this.linearGradient.addColorStop(0.0, '#3674B5');
        this.linearGradient.addColorStop(0.0, '#578FCA');
        this.linearGradient.addColorStop(0.7, '#A1E3F9');
        this.linearGradient.addColorStop(1.0, '#D1F8EF');
    }

    draw() {
        this.ctx.fillStyle = this.linearGradient;
        // Fill a rectangle with the gradient
        this.ctx.fillRect(this.x, this.y, this.width, this.height); 
    }
}

class Eagle extends ImageShape {
    constructor(x, y, scale) {
        var index = 1 + Math.round(Math.random());
        super(x, y, 198*scale, 125*scale, "./assets/image/eagle-" + index + ".png");

        this.deadSinceFrame = -1;

        // Mark the eagle not trigger any event
        this.valid = true;
    }

    newPos() {
        if (!this.isDead) {
            super.newPos();
        }

        if (this.deadElapsed == 3) {
            var explode = new Explosion(0, 0, 480, 480, 200);
            mainGame.addComponent(explode);
            explode.doExplode(this.x, this.y);

            this.parent.score += 10;
        }
        
        
        if (this.valid && this.checkHitBound() == Bound.Bottom) {
            this.parent.health -= 1;
            this.valid = false;
        }
    }
    
    isDisposed() {
        return this.deadElapsed > 4;
    }

    passOut() {
        var frame = this.parent.frameNo;

        this.valid = false;
        this.deadSinceFrame = frame;
    }

    get isDead() {
        return this.deadSinceFrame >= 0;
    }

    get deadElapsed() {
        if (! this.isDead) {
            return -1;
        }

        var frame = this.parent.frameNo;
        return frame - this.deadSinceFrame;
    }
}

class Explosion extends Component {
    constructor(x, y, width, height, particleCount) {
        super(x, y, width, height);
        
        this.explodeStartFrame = -9999;

        /// The delay of explode animation start
        this.explodeDelay = 1;

        for (var i=0; i<particleCount; i++) {
            var par = new Cube(0, 0, 6, 6, "red");
            this.children.push(par);
        }
    }

    draw() {
        var frame = this.parent.frameNo;
        var ctx = this.parent.canvas.getContext("2d");

        if (frame - this.explodeStartFrame > 1000) {
            return;
        }

        if (frame - this.explodeStartFrame == this.explodeDelay) {
            this._prepareExplode();
            this._startExplode();
        }

        var length = this.children.length;
        for (var i=0; i<length; i++) {
            this.children[i].parent = this.parent;

            this.children[i].draw();
        }
    }

    checkVisible() {
        var result;

        for (var i=0; i<this.children.length; i++) {
            result = this.children[i].checkVisible();
            if (result == Bound.No) {
                return Bound.No;
            }
        }

        return result;
    }

    isDisposed() {
        var frame = this.parent.frameNo;
        
        return this.checkVisible() != Bound.No && 
            this.explodeStartFrame != -9999 && 
            frame - this.explodeStartFrame > 100; 
    }

    doExplode(x, y) {
        var frame = this.parent.frameNo;

        this.explodeX = x;
        this.explodeY = y;
        this.explodeStartFrame = frame;
    }

    _prepareExplode() {
        var length = this.children.length;
        for (var i=0; i<length; i++) {
            this.children[i].x = this.explodeX;
            this.children[i].y = this.explodeY;
        }
    }

    _startExplode() {
        var length = this.children.length;
        for (var i=0; i<length; i++) {
            var speedRandSeed = Math.random();

            var speed = 2 + 6 * speedRandSeed;
            var angle = Math.PI * 2 * Math.random();

            const colorPattle = ["#DD0303", "#FA812F", "#FAB12F", "#FEF3E2"]
            var color = Math.round(colorPattle.length * speedRandSeed);
            color = colorPattle[color];

            this.children[i].color = color;
            this.children[i].speedX = speed * Math.cos(angle);
            this.children[i].speedY = speed * Math.sin(angle);
        }
    }
}

class ScoreIndicator extends Component {
    constructor(x, y) {
        super(x, y);

        const bgScale = 0.5;
        
        this.maxHealth = 3;

        this.padding = 10;

        this.scoreText = new TextBox({
            x: x+this.padding+50, 
            y: y+this.padding+7,
            color: "white",
        });
        this.scoreText.size = 18;

        this.hearts = this._generateHeartComponents(this.maxHealth);
        
        this.children = [
            this.scoreText, ...this.hearts
        ];
    }

    get score() {
        return this.parent.score;
    }

    set score(val) {
        this.parent.score = val;
    }

    get health() {
        return this.parent.health;
    }

    set health(val) {
        this.parent.score = val;
    }

    _generateHeartComponents(count) {
        var hearts = [];
        const heartSize = 22;
        const heartPadding = 3;

        const XPosBaseOffset = 0;
        const YPosBaseOffset = 0;

        for (var i=0; i<count; i++) {
            hearts.push(
                new ImageShape(
                    this.x+XPosBaseOffset+(heartSize+heartPadding)*(i-1) , this.y+YPosBaseOffset,
                    heartSize, heartSize,
                    "./assets/image/heart-solid.png"
                ),
            );
        }

        return hearts;
    }

    newPos() {
        // Upate score text
        this.scoreText.text = "Score:" + this.score;

        // Update health bar
        for (var i=0; i<this.maxHealth; i++) {
            if (i>=this.health) {
                this.hearts[i].src = "./assets/image/heart-empty.png";
            } else {
                this.hearts[i].src = "./assets/image/heart-solid.png";
            }
        }

        super.newPos();
    }

    isDisposed() {
        return this.disposed && !this.checkVisible()
    }

}

class KeyRecord {
    constructor(key) {
        this.key = key;
        this.pressedTime = 0;
        this.pressedState = false;
    }
}

const MoveDirection = { Up: 0, Down: 1, Left: 2, Right: 3};
class InputController {
    constructor() {
        // Store current key state in order of Top, Bottom, Left, Right
        this.moveKeysPressedTime = [0, 0, 0, 0];
        this.moveKeysPressedState = [false, false, false, false];

        this.up = new KeyRecord("ArrowUp");
        this.down = new KeyRecord("ArrowDown");
        this.left = new KeyRecord("ArrowLeft");
        this.right = new KeyRecord("ArrowRight");
        this.attack = new KeyRecord(" ");

        this.keys = [
            this.up,
            this.down,
            this.left,
            this.right,
            this.attack
        ];

        this.hasAttacked = false;
    }

    onKeyDownEvent(event) {
        var now = Date.now();
         

        for (var i=this.keys.length-1; i>=0; i--) {
            if (this.keys[i].key == event.key) {
                if (this.keys[i].pressedState == true) {
                    return;
                }

                this.keys[i].pressedTime = now;
                this.keys[i].pressedState = true;
                return;
            }
        }
    }

    onKeyUpEvent(event) {
        var now = Date.now();
        
        for (var i=this.keys.length-1; i>=0; i--) {
            if (this.keys[i].key == event.key) {
                // this.keys[i].pressedTime = now;
                this.keys[i].pressedState = false;
                return;
            }
        }
    }

    getDirections() {
        var vertical, horizontal;
        
        if (this.up.pressedState && this.down.pressedState) {
            vertical = this.up.pressedTime < this.down.pressedTime ? 1 : -1;
        } else if (!this.up.pressedState && !this.down.pressedState) {
            vertical = 0;
        } else {
            vertical = this.up.pressedState ? -1 : 1;
        }

        if (this.left.pressedState && this.right.pressedState) {
            horizontal = this.left.pressedTime < this.right.pressedTime ? 1 : -1;
        } else if (!this.left.pressedState && !this.right.pressedState) {
            horizontal = 0;
        } else {
            horizontal = this.left.pressedState ? -1 : 1;
        }

        return [horizontal, vertical];
    }

    getAttack() {
        var now = Date.now();

        if (this.attack.pressedState == false) {
            this.hasAttacked = false;
            return false;
        }

        if (now - this.attack.pressedTime > 500) {
            return true
        }

        if (this.hasAttacked == false && this.attack.pressedState == true) {
            this.hasAttacked = true;
            return true;
        }

        return false;
    }
}

class Cloud extends ImageShape {
    constructor(x, y, scale) {
        const IMAGE_WIDTH = 276;
        const Iamge_HEIGHT = 144;
        super(x, y, IMAGE_WIDTH*scale, Iamge_HEIGHT*scale);
        
        var randomNumber = Math.round(Math.random() * 5);
        this.image.src = "./assets/image/cloud-" + (randomNumber+1) + ".png";
        // this.image.src = "./assets/image/cloud-1.png"
        this.speedY = 7;
    }

    draw() {
        // console.log("CALLED" + this.x + ", Y=" + this.y)
        super.draw();
    }

    isDisposed() {
        return this.checkVisible() == Bound.Bottom || this.checkVisible() == Bound.Left;
    }
}