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

    if (this.constructor === Component) {
      throw new Error("Cannot instantiate abstract class AbstractShape directly.");
    }
  }

  start() {
    
  }

  draw(frame, ctx) {
    throw new Error("Method 'draw()' must be implemented by subclasses.");
  }

  newPos() {
    this.gravitySpeed += this.gravity;

    this.x += this.speedX;
    this.y += this.speedY + this.gravitySpeed;
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
    var frame = this.parent.frameNo;

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
    var frame = this.parent.frameNo;

    ctx.drawImage(
      this.image, 
      this.x, 
      this.y,
      this.width, 
      this.height
    );
  }

}



class HandGame extends Component {
  constructor(x, y, width, height, type) {
    super(x, y, width, height);

    this.paper = new Image();
    this.paper.src = 'https://em-content.zobj.net/source/apple/81/page-facing-up_1f4c4.png';

    this.scissors = new Image();
    this.scissors.src = 'https://symbl-cdn.com/i/webp/c4/aa8b2a5d6d7304241d56de9f82e3d9.webp';

    this.stone = new Image();
    this.stone.src = 'https://symbl-cdn.com/i/webp/f2/0e29d778af528ff18585b3c4088835.webp';

    this.type = type;
  }

  start() {
    var rand;
    rand = (Math.random() - 0.5 > 0) ? 1 : -1; 
    this.speedX = (1 + 1 * Math.random()) * rand;

    rand = (Math.random() - 0.5 > 0) ? 1 : -1;
    this.speedY = (1 + 1 * Math.random()) * rand;
  }

  calcNewType(other) {
    if (this.type == "scissors" && other.type == "stone") {
      return "stone";
    }

    if (this.type == "paper" && other.type == "scissors") {
      return "scissors";
    }

    if (this.type == "stone" && other.type == "paper") {
      return "paper";
    }

    return this.type;
  }

  draw() {
    var ctx = this.parent.canvas.getContext("2d");
    var frame = this.parent.frameNo;

    var image;
    
    var collusion = this.checkHitBound();


    // Handle in bound 
    switch (collusion) {
      case Bound.Top:
        this.speedY = Math.abs(this.speedY);
        break;
      case Bound.Bottom:
        this.speedY = -Math.abs(this.speedY);
        break;

      case Bound.Left:
        this.speedX = Math.abs(this.speedX);
        break;
      case Bound.Right:
        this.speedX = -Math.abs(this.speedX);
        break;
    }

    // Handle win or lose
    for (var i=0; i<this.parent.components.length; i++) {
      if (this.parent.components[i] == this) {
        continue;
      }

      if (!this.crashWith(this.parent.components[i])) {
        continue;
      }

      this.type = this.calcNewType(this.parent.components[i]);
    }

    if (this.type == "paper") {
      image = this.paper;
    } else if ( this.type == "scissors" ) {
      image = this.scissors;
    } else if ( this.type == "stone" ){
      image = this.stone;
    }

    ctx.drawImage(
      image, 
      this.x, 
      this.y,
      this.width, 
      this.height
    );
  }
}

class GameController {
  constructor(name, framerate, components, onStart) {
    this.canvas = document.createElement(name);
    this.framerate = framerate;
    this.components = components;
    this.frameNo = 0;

    this.onStart = onStart;
  }

  init(id, width, height) {
    this.canvas.width = width == undefined ? 480 : width;
    this.canvas.height = height == undefined ? 480 : height;

    this.context = this.canvas.getContext("2d");

    var canva = document.getElementById(id);
    canva.replaceWith(this.canvas);
  }

  start() {
    this.reset();
    this.resume();
  }

  resume() {
    this.interval = setInterval(() => this.updateGameArea(this), this.framerate);
  }

  pause() {
    clearInterval(this.interval);
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  reset() {
    this.pause();
    this.components = [];
    
    this.onStart();

    var length = this.components.length;
    for (var i=0; i<length; i++) {
      this.components[i].parent = this;
      this.components[i].start();
    }

    this.updateGameArea(this)
  }
  
  updateGameArea(self) {
    var length = self.components.length;
    self.clear();

    for (var i=0; i<length; i++) {
      self.components[i].newPos();
      self.components[i].draw();
    }

    self.frameNo += 1;
  }

  addCompoinent(object) {
    object.parent = this;
    this.components.push(object);
  }
}