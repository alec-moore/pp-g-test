class Bottle {
    constructor(spritePath, streamSpritePath, defaultPosition, deactivateBottles) {
        this.sprite = loadSprite(spritePath);
        this.streamSprite = loadSprite(streamSpritePath);

        this.pickedUp = false;
        this.defaultPosition = defaultPosition;
        this.deactivateAllBottles = deactivateBottles;
        this.initSprites();
    }

    initSprites() {
        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.defaultPosition.x;
        this.sprite.y = this.defaultPosition.y;
        this.sprite
            .on('pointerdown', this.activateBottle)
            .on('pointermove', this.bottleMove)
            .on('pointerup', this.deactivateStream)
            .on('pointerupoutside', this.deactivateStream);

        this.streamSprite.interactive = true;
        this.streamSprite.buttonMode = true;
        this.streamSprite.anchor.set(0.5);
        this.streamSprite.x = -1000;
        this.streamSprite.y = -1000;
        this.streamSprite
            .on('pointermove', this.streamMouse);
    }

    deactivateStream = () => {
        this.streamSprite.active = false;
        this.streamSprite.x = -1000;
        this.streamSprite.y = -1000;
    }

    bottleMove = (e) => {
        if (this.pickedUp) {
            const newPosition = e.data.global;
            this.sprite.x = newPosition.x;
            this.sprite.y = newPosition.y;
        }
    }

    activateBottle = () => {
        if (!this.pickedUp) {
            this.deactivateAllBottles();
            this.sprite.alpha = .5;
            this.pickedUp = true;
            this.sprite.scale.y = -1;
        }
        else {
            if (this.isPuttingBottleBack()) {
                //reset 
                this.sprite.alpha = 1;
                this.pickedUp = false;
                this.sprite.scale.y = 1;
                this.sprite.x = this.defaultPosition.x;
                this.sprite.y = this.defaultPosition.y;
            }
            else {
                this.streamSprite.active = true;
                this.streamSprite.x = this.sprite.x;
                this.streamSprite.y = this.sprite.y + 100;
            }
        }
    }

    isPuttingBottleBack() { // TODO fix this boundary check
        const bounds1 = this.sprite.getBounds();
        const defaultPosition = this.defaultPosition;

        return bounds1.x < defaultPosition.x + (bounds1.width / 2)
            && bounds1.x + (bounds1.width / 2) > defaultPosition.x
            && bounds1.y < defaultPosition.y + (bounds1.height / 2)
            && bounds1.y + (bounds1.height / 2) > defaultPosition.y;
    }

    streamMouse = (e) => {
        if (this.streamSprite.active) {
            const newPosition = e.data.global;
            this.streamSprite.x = newPosition.x;
            this.streamSprite.y = newPosition.y + 100;
        }
    }

    deactiveBottle() {
        this.sprite.alpha = 1;
        this.pickedUp = false;
        this.sprite.scale.y = 1;
        this.sprite.x = this.defaultPosition.x;
        this.sprite.y = this.defaultPosition.y;
        this.streamSprite.active = false;
    }
}

class Switch {
    constructor(sprite, streamSprite, switchPosition, streamPosition) {
        this.active = false;
        this.sprite = loadSprite(sprite);
        this.stream = loadSprite(streamSprite);
        this.position = switchPosition;
        this.streamPosition = streamPosition;

        this.initSprites();
    }

    initSprites() {
        this.stream.anchor.set(0.5);
        this.stream.x = -1000;
        this.stream.y = -1000;

        this.sprite.interactive = true;
        this.sprite.buttonMode = true;
        this.sprite.anchor.set(0.5);
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;

        this.sprite
            .on('pointerdown', this.activate)
            .on('pointerup', this.deactivate)
            .on('pointerupoutside', this.deactivate);
    }

    activate = () => {
        if (this.active) return;

        this.active = true;
        this.sprite.scale.y = -1;
        this.stream.x = this.streamPosition.x;
        this.stream.y = this.streamPosition.y;
    }

    deactivate = () => {
        this.active = false;
        this.sprite.scale.y = 1;
        this.stream.x = -1000;
        this.stream.y = -1000;
    }

}

class RandomCupGenerator {
    constructor() {
        this.instructions = [];
        this.evaluationColors = [];
        this.randomCup = undefined; // Could hold graphics for the top bar later
        this.generateRandomCup();
    }

    generateRandomCup() {
        const randomMap = [
            'chocolate_text.jpg',
            'decaf_text.jpg',
            'water_text.jpg',
            'creme_text.jpg',
            'milk_text.jpg'
        ];

        const randomEvaluationMap = [
            CHOCOLATE_BROWN,
            COFFEE_BROWN,
            WATER_BLUE,
            CREME_WHITE,
            MILK_WHITE
        ];

        this.instructions = [];
        this.evaluationColors = [];

        for (let i = 0; i < 3; i++) {
            // No duplicate instructions (for now)
            let randomNum;
            do {
                randomNum = Math.floor(Math.random() * randomMap.length);
            } while (this.instructions.includes(randomMap[randomNum]));

            this.instructions.push(randomMap[randomNum]);
            this.evaluationColors.push(randomEvaluationMap[randomNum]);
        }
    };
}

class InstructionsDrawer {
    constructor(instructions) {
        if (!instructions || instructions.length == 0) return;
        this.update(instructions);
    }

    update(instructions) {
        this.textLineOne = loadSprite(instructions[0]);
        this.textLineOne.x = 352;
        this.textLineOne.y = 1;
        this.textLineTwo = loadSprite(instructions[1]);
        this.textLineTwo.x = 352;
        this.textLineTwo.y = 27;
        this.textLineThree = loadSprite(instructions[2]);
        this.textLineThree.x = 352;
        this.textLineThree.y = 53;
    }
}

class Cup {
    constructor() {
        this.fillCounter = 0;
        this.speed = 0.0;
        this.sprite = loadSprite('cup.jpg');
        this.fillBottom = loadSprite('cup_bottom_filled.png');
        this.fillMid = loadSprite('cup_mid_filled.png');
        this.fillTop = loadSprite('cup_top_filled.png');
        this.contents = [];

        this.sprite.x = -100;
        this.sprite.y = 600;
        this.fillBottom.y = this.sprite.y;
        this.fillMid.y = this.sprite.y;
        this.fillTop.y = this.sprite.y;

        this._fillCupMap = {
            0: (color) => this.fillBottom.tint = color,
            1: (color) => this.fillMid.tint = color,
            2: (color) => this.fillTop.tint = color
        }
    }

    updateX(xVal) {
        this.sprite.x = xVal;
        this.fillBottom.x = xVal;
        this.fillMid.x = xVal;
        this.fillTop.x = xVal;
    }

    addSpeed(addition) {
        this.speed += addition;
    }

    fill(color, successFn) {
        if (cup.contents.length >= 3) return;

        this.fillCounter += 5;
        if (this.fillCounter >= 100) {
            const position = this.contents.length;
            this._fillCupMap[position](color)
            this.contents.push(color);
            this.fillCounter = 0;
            if (successFn) successFn();
        }
    }

    reset() {
        this.sprite.x = -100;
        this.speed = 0.0;
        this.contents = [];
        this.fillBottom.tint = PURE_WHITE;
        this.fillMid.tint = PURE_WHITE;
        this.fillTop.tint = PURE_WHITE;
    }
}

const MILK_WHITE = 0XFCF8E2;
const CREME_WHITE = 0XF9EEB8;
const COFFEE_BROWN = 0X553434;
const WATER_BLUE = 0X7DD6E7;
const CHOCOLATE_BROWN = 0Xd2691e;
const PURE_WHITE = 0XFFFFFF;

let score = 0;
let GAME_OVER = false;

let app = new PIXI.Application({ width: 1024, height: 768, transparent: true });
document.body.appendChild(app.view);

let backgroundSprite = loadSprite('bg.jpg');
let cup = new Cup();
let creme = new Bottle('creme.jpg', 'stream.jpg', { x: 127, y: 400 }, deactivateBottles);
let milk = new Bottle('milk.jpg', 'stream.jpg', { x: 53, y: 400 }, deactivateBottles);
let decafSwitch = new Switch('switch.jpg', 'decaf_stream.jpg', { x: 362, y: 323 }, { x: 305, y: 600 });
let waterSwitch = new Switch('switch.jpg', 'water_stream.jpg', { x: 508, y: 323 }, { x: 600, y: 600 });
let chocolateSwitch = new Switch('switch.jpg', 'chocolate_stream.jpg', { x: 960, y: 323 }, { x: 890, y: 600 });
let randomCupGenerator = new RandomCupGenerator();
let instructions = new InstructionsDrawer(randomCupGenerator.instructions);

let elapsed = 0.0;
let cupCount = 0;
let MAX_CUPS = 15;

const scoreText = new PIXI.Text(`SCORE: ${score}`);
scoreText.x = 800;
scoreText.y = 40;
app.stage.addChild(scoreText);

app.ticker.add((delta) => {
    // Add the time to our total elapsed time
    if (GAME_OVER) return;

    elapsed += delta;

    cup.addSpeed(delta + (elapsed / 5000)); // SPEED UP FASTER DEPENDING HOW LONG THE APP IS RUNNING

    // TODO: If it's filled let's move it faster.
    cup.updateX(-100 + cup.speed);

    if (cup.sprite.x >= 1024) // the cup is off screen
        handleResetCup();
    if (elapsed >= 1000000)
        elapsed = 0;

    if (testForCollision(cup.sprite, decafSwitch.stream))
        cup.fill(COFFEE_BROWN, decafSwitch.deactivate);
    else if (testForCollision(cup.sprite, waterSwitch.stream))
        cup.fill(WATER_BLUE, waterSwitch.deactivate)
    else if (testForCollision(cup.sprite, chocolateSwitch.stream))
        cup.fill(CHOCOLATE_BROWN, chocolateSwitch.deactivate);
    else if (testForCollision(cup.sprite, milk.streamSprite))
        cup.fill(MILK_WHITE, milk.deactivateStream);
    else if (testForCollision(cup.sprite, creme.streamSprite))
        cup.fill(CREME_WHITE, creme.deactivateStream);

    if (cupCount >= MAX_CUPS) {
        console.log('GAME OVER, score:', score); //~1m:45s?
        GAME_OVER = true;
        const gameOverText = new PIXI.Text(`GAME OVER! Score: ${score}`);
        gameOverText.x = 10;
        gameOverText.y = 40;
        app.stage.addChild(gameOverText);
    }
});

function handleResetCup() {
    evaluateCup();
    randomCupGenerator.generateRandomCup();
    instructions.update(randomCupGenerator.instructions);
    cup.reset();
    cupCount++;
}

function evaluateCup() {
    const evalColors = [...randomCupGenerator.evaluationColors];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (cup.contents[i] === evalColors[j]) {
                evalColors.splice(j, 1);
                break;
            };
        }

        if (i == 2 && evalColors.length == 0) updateScore(50);
    }
}

function updateScore(amount) {
    score += amount;
    console.log('NEW SCORE:', score);
    scoreText.text = `SCORE: ${score}`;
    //TODO UPDATE DRAW SCORE
}

function deactivateBottles() {
    milk.deactiveBottle();
    creme.deactiveBottle();
}

function loadSprite(filename) {
    let spriteObj = PIXI.Sprite.from('assets/' + filename);
    app.stage.addChild(spriteObj);
    return spriteObj;
}

function testForCollision(object1, object2) {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return bounds1.x < bounds2.x + bounds2.width
        && bounds1.x + bounds1.width > bounds2.x
        && bounds1.y < bounds2.y + bounds2.height
        && bounds1.y + bounds1.height > bounds2.y;
}