class ScoreSummarize extends Component {
    constructor(x, y) {
        super(x, y);

        const bgScale = 0.5;
        
        this.maxHealth = 3;

        this.padding = 10;

        this.score = 0;
        this.health = 3;

        this.background = new ImageShape(x, y, 736*bgScale, 148*bgScale, "./assets/image/score-bg.png");

        this.scoreText = new TextBox({
            x: x+this.padding+60,
            y: y+this.padding+20,
            color: "white",
            text: "",
            size: 18
        });

        this.ratingText = new TextBox({
            x: x+this.padding+60,
            y: y+this.padding+45,
            color: "white",
            text: "Rating: Out of the park",
            size: 18
        });
        
        this.ratingIcon = new TextBox({
            x: x+this.padding+15,
            y: y+this.padding+45,
            color: "gold",
            text: "S",
            size: 45
        });
        
        this.children = [
            this.background, this.scoreText, this.ratingText, this.ratingIcon
        ];
    }

    newPos() {
        // Upate score text
        this.scoreText.text = "Score:" + this.parent.score;
        
        super.newPos();
    }

    isDisposed() {
        return this.disposed && this.checkVisible();
    }
    
    setScore({rating, description, color}) {
        this.ratingText.text = description;
        this.ratingIcon.text = rating;
        this.ratingIcon.color = color;
    }
}