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

    for (var i=0; i<this.parent.children.length; i++) {
      if (this.parent.children[i].type != "obstacle") {
        continue;
      }

      if (this.crashWith(this.parent.children[i])) {
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

class DragAndDropState {
  static mouseDown = false;

  static xDelta = 0;
  static yDelta = 0;

  static onDraw(frame) {
    if (frame == 0) {
      DragAndDropState.setup();
    }
  }

  static setup() {
    dragAndDrop.addComponent(new DragAndDrop(60, 60, 50, 50, "blue"));

    dragAndDrop.canvas.addEventListener('mousedown', function (e) {

      const rect = dragAndDrop.canvas.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;

      console.log("Mouse clicked on (x=" + mouseX + "," + mouseY + ")")

      var virtualObj = new Cube(mouseX ,mouseY, 1, 1, "red");

      if (!virtualObj.crashWith(dragAndDrop.children[0])) return;

      DragAndDropState.xDelta = mouseX - dragAndDrop.children[0].x;
      DragAndDropState.yDelta = mouseY - dragAndDrop.children[0].y;

      DragAndDropState.mouseDown = true;
    })

    dragAndDrop.canvas.addEventListener('mouseup', function (e) {
      DragAndDropState.mouseDown = false;
    })

    dragAndDrop.canvas.addEventListener('mousemove', function (e) {
      if (! DragAndDropState.mouseDown) return;

      const rect = dragAndDrop.canvas.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;

      dragAndDrop.children[0].x = mouseX - DragAndDropState.xDelta;
      dragAndDrop.children[0].y = mouseY - DragAndDropState.yDelta;
    })
  }
}


var bouncdGame, dragAndDrop;

class ImageGameState {

  static setup() {
    const count = 3;
    for (var i=0; i<count; i++) {
      bouncdGame.addComponent(
        new MovingSmile(30, 30, 30,30));
    }

    bouncdGame.canvas.addEventListener('click', function (e) {
      bouncdGame.addComponent(new Obstacle(e.pageX-20, e.pageY-70, 15, 10, "blue"));
    })

    bouncdGame.addComponent(new Obstacle(260, 260, 100, 20, "red"));
  }

  static _drawAddObstacle() {
    var width = 15 + 30 * Math.random();
    var height = 15 + 30 * Math.random();

    var xPos = 480 * Math.random();
    var yPos = 480 * Math.random();

    bouncdGame.addComponent(new Obstacle(xPos, yPos, width, height, "red"));
  }
  
  static onDraw(frame) {
    if (frame == 0) {
      ImageGameState.setup();
    }

    if (frame % 100 == 0) {
      ImageGameState._drawAddObstacle();
    }
  }
}

function main() {
  bouncdGame = new GameController("image_game", ImageGameState.onDraw);
  bouncdGame.start();

  dragAndDrop = new GameController("drag_and_drop", DragAndDropState.onDraw)
  dragAndDrop.start();
}

window.onload = main