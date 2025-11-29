
class MovingSmile extends Component {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.smile = new Image();
    this.smile.src = 'https://www.w3schools.com/graphics/smiley.gif';

    this.angry = new Image();
    this.angry.src = 'https://www.w3schools.com/graphics/angry.gif';

    this.crash = new Image();
    this.crash.src = 'https://m.media-amazon.com/images/I/715vwvP5ZEL.png';
    
    this.lastCollusionFrame = -1000;
  }

  start() {
    this.speedX = 1 + 3 * Math.random();
    this.speedY = 1 + 3 * Math.random();
  }

  draw() {
    var ctx = this.parent.canvas.getContext("2d");
    var frame = this.parent.frameNo;

    var image;
    
    var collusion = this.checkHitBound();

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

    if (collusion != Bound.No) {
      this.lastCollusionFrame = frame;
      return;
    }

    if (frame - this.lastCollusionFrame < 25) {
      image = this.crash;
    } else if ( Math.round(frame / 25) % 2 == 0 ) {
      image = this.smile;
    } else {
      image = this.angry;
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

function setupHandGame() {
  var types = ["paper", "scissors", "stone"];

  const count = 30;

  var root = Math.round( Math.sqrt(30) );
  
  var partWidth = 480 / root;
  var partHeight = 480 / root;

  var placeX = 0; 
  var placeY = 0;

  for (var i=0; i<count; i++) {
    var randX = placeX + Math.random() * partWidth;
    var randY = placeY + Math.random() * partHeight;

    handGame.addComponent(new HandGame(randX,randY,30,30, types[i%3]));

    // console.log("X= " + placeX + ", Y= ", placeY);
    
    if (i % root == 0) {
      placeX = 0;
      placeY += partHeight;
    } else {
      placeX += partWidth;
    }

    placeY = (placeY > 450) ? 0 : placeY;
    placeX = (placeX > 450) ? 0 : placeX;
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
    for (var i=0; i<this.parent.children.length; i++) {
      if (this.parent.children[i] == this) {
        continue;
      }

      if (!this.crashWith(this.parent.children[i])) {
        continue;
      }

      this.type = this.calcNewType(this.parent.children[i]);
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


function setupImageGame() {
  const count = 3;
  for (var i=0; i<count; i++) {
    imageGame.addComponent(
      new MovingSmile(30, 30, 30,30));
  }
}

var handGame, imageGame;

function reset() {
  handGame.pause();
  handGame.children = [];
  setupHandGame();
}

function main() {
  imageGame = new GameController("image_game", (f) => {
    if (f == 0) setupImageGame();
  });

  handGame = new GameController("hand_game", (f) => {
    if (f == 0) setupHandGame();
  });

  handGame.start();
  imageGame.start();
}

window.onload = main