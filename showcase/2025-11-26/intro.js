class GameTitle extends Component {
    constructor(x, y) {
        super(x, y, 0, 0);

        this.text1 = new TextBox({
            x: x, 
            y: y, 
            color: "white", 
            text: "It's out of the"
        });

        this.text2 = new TextBox({
            x: x, 
            y: y, 
            color: "white", 
            text: "Park"
        });

        this.scale = 1;

        this.children = [
            this.text1, this.text2
        ]
        
    }

    set scale(val) {
        this.text1.size = 22 * val;
        this.text2.size = 85 * val;

        this._scale = val;
    }

    newPos() {
        var xOffset = 100 * (1-this._scale);
        this.text1.x = this.x + xOffset;
        this.text1.y = this.y;
        
        this.text2.x = this.x + xOffset;
        this.text2.y = this.y + 75*this._scale;

        super.newPos();
    }
}

class ElephantShrew extends ImageShape {
    constructor(x, y, scale) {
        super(x, y, 862*scale, 373*scale, "");

        this.speed = 2;

        this.scale = scale;
    }

    draw() {
        var ctx = this.parent.canvas.getContext("2d");

        if (this.speedX > 0) {
            this.src = "./assets/image/elephant-shrew-r.png"
        } else {
            this.src = "./assets/image/elephant-shrew-l.png"
        }

        super.draw();
        // ctx.drawImage(img, 0, 0, img.width, img.height); // Draw at the transformed origin;
    }

    isDisposed() {
        var visibility = this.checkVisible();

        return (visibility == Bound.Left && this.speedX < 0) ||
                (visibility == Bound.Right && this.speedX > 0);
    }
}