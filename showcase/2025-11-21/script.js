
class MovingSmile extends Component {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.smile = new Image();
    this.smile.src = 'https://www.w3schools.com/graphics/smiley.gif';

    this.angry = new Image();
    this.angry.src = 'https://www.w3schools.com/graphics/angry.gif';

    this.crash = new Image();
    this.crash.src = 'https://m.media-amazon.com/images/I/715vwvP5ZEL.png';
    
    this.lastCollusionFrame = 0;
  }

  start() {
    this.speedX = 1 + 3 * Math.random();
    this.speedY = 1 + 3 * Math.random();
  }

  draw() {
    var ctx = this.parent.canvas.getContext("2d");
    var frame = this.parent.frameNo;

    var image;

    var hitBound = this.checkHitBound();

    switch (hitBound) {
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

    if (hitBound != Bound.No) {
      this.lastCollusionFrame += 1;
      return;
    }

    if ( this.lastCollusionFrame % 2 == 0 ) {
      image = this.smile;
    } else {
      image = this.angry;
    }

    for (var i=0; i<this.parent.components.length; i++) {
      if (this.parent.components[i].type != "obstacle") {
        continue;
      }

      if (this.crashWith(this.parent.components[i])) {
        this.speedX = 0;
        this.speedY = 0;
        image = this.crash;
      }
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

class Obstacle extends Cube {
  constructor(x, y, width, height, color) {
    super(x, y, width, height, color);

    this.type = "obstacle";
  }
}

class DragAndDrop extends Cube {
  constructor(x, y, width, height, color) {
    super(x, y, width, height, color);

    this.type = "dnd";
  }
}

function addObstacle() {
  var width = 15 + 30 * Math.random();
  var height = 15 + 30 * Math.random();

  var xPos = 480 * Math.random();
  var yPos = 480 * Math.random();

  imageGame.addComponent(new Obstacle(xPos, yPos, width, height, "red"));
}

function onImageGameStart() {
  const count = 3;
  for (var i=0; i<count; i++) {
    imageGame.components.push(
      new MovingSmile(30, 30, 30,30));
  }

  imageGame.components.push(new Obstacle(260, 260, 100, 20, "red"));

  setInterval(addObstacle, 2000);
}

var imageGame = new GameController("canvas", 10, [], onImageGameStart)

imageGame.canvas.addEventListener('click', function (e) {
  imageGame.addComponent(new Obstacle(e.pageX-20, e.pageY-70, 15, 10, "blue"));
})

function onDragAndDropStart() {
  dragAndDrop.components.push(new DragAndDrop(60, 60, 15, 10, "blue"));
}

var dragAndDrop = new GameController("canvas", 10, [], onDragAndDropStart)

var mouseDown = false;

dragAndDrop.canvas.addEventListener('mousedown', function (e) {
  var mouseX = e.clientX - 20;
  var mouseY = e.clientY - 380;

  var virtualObj = new Cube(mouseX+5 ,mouseY+5, 1, 1, "red");

  if (!virtualObj.crashWith(dragAndDrop.components[0])) return;

  mouseDown = true;
})

dragAndDrop.canvas.addEventListener('mouseup', function (e) {
  mouseDown = false;
})

dragAndDrop.canvas.addEventListener('mousemove', function (e) {
  if (! mouseDown) return;

  var mouseX = e.clientX - 20;
  var mouseY = e.clientY - 380;

  

  dragAndDrop.components[0].x = mouseX;
  dragAndDrop.components[0].y = mouseY;
})
