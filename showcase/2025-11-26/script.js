class SpaceShip extends Component {

}

class Explosion extends Component {
    constructor(x, y, width, height, particleCount) {
        super(x, y, width, height);
        
        this.particle = [];

        for (var i=0; i<particleCount; i++) {
            var obj = new Cube(x+width/2 + y+height/2, 1, 1, "red");

            obj.speedX = Math.random();
            obj.speedY = Math.random();
            this.particle.push(obj);
        }
    }

    newPos() {
        super.newPos();
        var length = this.particle.length;
        for (var i=0; i<length; i++) {
            this.particle[i].newPos();
        }

        console.log("asdasd");
    }

    draw() {
        var length = this.particle.length;
        for (var i=0; i<length; i++) {
            this.particle[i].draw();
        }
    }
}

function gameInitialization() {

}

var mainGame = new GameController(
    "canvas", 
    20, 
    [
        new Explosion(0, 0, 480, 480, 400)
    ],
    gameInitialization
);