const SMILE = "https://www.w3schools.com/graphics/smiley.gif";
const ANGRY = "https://www.w3schools.com/graphics/angry.gif";

var cubeShape, lShape, imageShape, background;

function LShapeSetSPD(x, y) {
  lShape.speedX = x;
  lShape.speedY = y;
}

function ImageShapeSetSPD(x, y) {
  imageShape.speedX = x;
  imageShape.speedY = y;

  if (x==0 && y ==0) {
    imageShape.image.src = SMILE;
  } else {
    imageShape.image.src = ANGRY;
  }
}

function demoGameStart() {
  cubeShape = new Cube(30, 30, 30, 30, "red");
  lShape = new LShape(30, 90, 60, 90, "red");
  imageShape = new ImageShape(120, 120, 30, 30, SMILE)

  demoGame.addComponent(cubeShape);
  demoGame.addComponent(lShape);
  demoGame.addComponent(imageShape);
}

var demoGame;

function main() {
  demoGame = new GameController("demo", (f) => {
    if (f == 0) demoGameStart();
  });

  demoGame.start();
}