const Bound = { No: 0, Top: 1, Bottom: 2, Left: 3, Right: 4};

class Component {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.gravity = 0;
    this.gravitySpeed = 0;

    this.children = [];

    if (this.constructor === Component) {
      throw new Error("Cannot instantiate abstract class AbstractShape directly.");
    }
  }

  start() {
    var length = this.children.length;
    
    for (var i=0; i<length; i++) {
      this.children[i].parent = this.parent;
    }
  }

  draw() {
    var length = this.children.length;

    for (var i=0; i<length; i++) {
      this.children[i].draw();
    }
  }

  newPos() {
    this.gravitySpeed += this.gravity;

    this.x += this.speedX;
    this.y += this.speedY + this.gravitySpeed;

    var length = this.children.length;

    for (var i=0; i<length; i++) {
      this.children[i].speedX += this.speedX;
      this.children[i].speedY += this.speedY;
      this.children[i].gravitySpeed += this.gravitySpeed;

      this.children[i].newPos();

      this.children[i].speedX -= this.speedX;
      this.children[i].speedY -= this.speedY;
      this.children[i].gravitySpeed -= this.gravitySpeed;
    }
  }

  checkHitBound() {
    var maxHeight = this.parent.canvas.height;
    var maxWidth = this.parent.canvas.width;

    if (this.x + this.width >= maxWidth) {
      return Bound.Right;
    }

    if (this.y + this.height >= maxHeight) {
      return Bound.Bottom;
    }

    if (this.x <= 0) {
      return Bound.Left;
    }

    if (this.y <= 0) {
      return Bound.Top;
    }
 
    return Bound.No;
  }

  checkVisible() {
    var maxHeight = this.parent.canvas.height;
    var maxWidth = this.parent.canvas.width;

    if (this.x + this.width < 0) {
      return Bound.Left;
    }

    if (this.x > maxWidth) {
      return Bound.Right;
    }

    if (this.y + this.height < 0) {
      return Bound.Top;
    }

    if (this.y > maxHeight) {
      return Bound.Bottom;
    }

    return Bound.No;
  }

  crashWith(object) {
    var thisXStart = this.x;
    var thisXEnd = this.x + this.width;

    var thisYStart = this.y;
    var thisYEnd = this.y + this.height;

    var thatXStart = object.x;
    var thatXEnd = object.x + object.width;

    var thatYStart = object.y;
    var thatYEnd = object.y + object.height;

    // 1. A 在 B 的右邊
    if (thisXStart > thatXEnd) {
      return false;
    }

    // 2. A 在 B 的左邊
    if (thisXEnd < thatXStart) {
      return false;
    }

    // 3. A 在 B 的下方
    if (thisYStart > thatYEnd) {
      return false;
    }

    // 4. A 在 B 的上方
    if (thisYEnd < thatYStart) {
      return false;
    }

    return true;
  }

  isDisposed() {
    return false;
  }
}

class TextBox extends Component {
  constructor({x, y, text, color, font="PixelCode", size=24}) {
    super(x, y, 0, 0);

    this.size = size;
    this.font = font;
    this.text = text;
    this.color = color;
  }

  start() {
    super.start();
  }

  draw() {    
    var ctx = this.parent.canvas.getContext("2d");

    ctx.fillStyle = this.color;
    ctx.font = this.size + "px " + this.font;
    ctx.fillText(this.text, this.x, this.y);
  }
}

class Cube extends Component {
  constructor (x, y, width, height, color) {
    super(x, y, width, height);
    this.color = color;
  }

  draw() {
    var ctx = this.parent.canvas.getContext("2d");
    var frame = this.parent.frameNo;

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class LShape extends Component {
  constructor(x, y, width, height, color) {
    super(x, y, width, height);
    this.color = color;
  }

  draw() {
    var ctx = this.parent.canvas.getContext("2d");

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width/2, this.height);
    ctx.fillRect(this.x+this.width/2, this.y+this.height/3*2, this.width/2, this.height/3);
  }

}

class ImageShape extends Component {
  constructor(x, y, width, height, src) {
    super(x, y, width, height);
    
    this.image = new Image();
    this.image.src = src;
  }

  set src(val) {
    this.image.src = val;
  }

  draw() {
    var ctx = this.parent.canvas.getContext("2d");
    
    ctx.drawImage(
      this.image, 
      this.x, 
      this.y,
      this.width, 
      this.height
    );

    super.draw()
  }

}

class GameController {
  constructor(id, onDraw) {
    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext("2d");

    this.frameNo = 0;
    this.children = [];
    
    this._framerate = 20;
    this.onDraw = onDraw;
  }

  get framerate() {
    return this._framerate;
  }

  set framerate(val) {
    if (val < 0) {
      return;
    }

    this._framerate = val;
    this.pause();
    this.start();
  }

  start() {
    if (this.interval != undefined) {
      throw "Game is already running";
    }

    this.interval = setInterval(() => this.loopGame(this), this._framerate);
  }

  pause() {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  dispose() {
    clearInterval(this.interval);
    this.children = [];
  }

  clearGarbage() {
    // console.log("asdd")
    var length = this.children.length;

    for (var i = length - 1; i >= 0; i--){
        if (!this.children[i].isDisposed()) {
            continue;
        }

        this.children.splice(i, 1);
    }
  }

  // printObectCount() {
  //   console.log(this.children);
  // }
  
  loopGame(self) {
    if (this.onDraw != undefined) {
      this.onDraw(self.frameNo);
    }

    // if (this.frameNo % 50 == 0) {
    //   this.printObectCount();
    // }

    self.clear();
    
    self.clearGarbage();
    
    var length = self.children.length;
    for (var i=0; i<length; i++) {
      self.children[i].newPos();
      self.children[i].draw();
    }

    self.frameNo += 1;
  }

  addComponent(object, index) {
    index = (index==undefined) ? this.children.length : index;

    object.parent = this;
    // this.children.push(object);

    this.children.splice(index, 0, object);

    object.start();
  }
}