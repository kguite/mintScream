const canvas = document.getElementById('canvas1')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const collisionCanvas = document.getElementById('collisionCanvas')
const collisionCtx = collisionCanvas.getContext('2d')
collisionCanvas.width = window.innerWidth
collisionCanvas.height = window.innerHeight

let score = 0
let gameOver = false
ctx.font = '50px Impact'

let timeToNextBat = 0
let batInterval = 500
let lastTime = 0

let bats = []
class Bat {
    constructor(){
        this.spriteWidth = 473;
        this.spriteHeight = 468;
        this.sizeModifier = Math.random() * 0.3 + 0.1;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false
        this.image = new Image();
        this.image.src = 'images/bat.png';
        this.frame = 0
        this.maxFrame = 4
        this.timeSinceMove = 0;
        this.moveInterval = Math.random() * 50 + 50
        this.randomColors = [Math.floor(Math.random() * 255),Math.floor(Math.random() * 255),Math.floor(Math.random() * 255)]
        this.color = `rgb(${this.randomColors[0]},${this.randomColors[1]}, ${this.randomColors[2]}`
        

    }
    update(deltaTime){
        if(this.y < 0 || this.y > canvas.height - this.height){
            this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY
        if(this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceMove += deltaTime
        if(this.timeSinceMove > this.moveInterval){
            if(this.frame > this.maxFrame) this.frame = 0
            else this.frame++
            this.timeSinceMove = 0
        }
        if(this.x < 0 -this.width) gameOver = true
    }
    draw(){
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size){
        this.image = new Image();
        this.image.src = 'images/boom.png';
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y; 
        this.frame = 0; 
        this.sound = new Audio();
        this.sound.src = 'sounds/boom.wav'
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false


    }

    update(deltaTime){
        if(this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if( this.timeSinceLastFrame > this.frameInterval){
            this.frame++
            this.timeSinceLastFrame = 0;
            if(this.frame > 5) this.markedForDeletion = true
        }
    }

    draw(){
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size/4, this.size, this.size)
    }
}

function drawScore(){
    ctx.fillStyle = 'red';
    ctx.fillText('Score: ' + score, 50, 75)
    ctx.fillStyle = 'white';
    ctx.fillText('Score: ' + score, 52, 77)
}

function drawGameOver(){
    ctx.textAlign = 'center'
    ctx.fillStyle = 'red';
    ctx.fillText(`GAME OVER! Your score is: ${score}`, canvas.width/2, canvas.height/2)
    ctx.fillStyle = 'white';
    ctx.fillText(`GAME OVER! Your score is: ${score}`, canvas.width/2 +2, canvas.height/2+2)
  

}

window.addEventListener('click', function(e){
    const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1)
    console.log(detectPixelColor)
    const pc = detectPixelColor.data;
    bats.forEach(obj => {
        if(obj.randomColors[0] === pc[0] && obj.randomColors[1] === pc[1] && obj.randomColors[2] === pc[2]){
            obj.markedForDeletion = true
            score++
            explosions.push(new Explosion(obj.x, obj.y, obj.width))
        }
    })
})

const bat = new Bat();

function animate(timestamp){
    ctx.clearRect(0,0,canvas.width, canvas.height)
    collisionCtx.clearRect(0,0,canvas.width, canvas.height)
    let deltaTime = timestamp - lastTime
    lastTime = timestamp
    timeToNextBat += deltaTime
    if(timeToNextBat > batInterval){
        bats.push(new Bat())
        timeToNextBat = 0
        bats.sort((a, b) => a.width - b.width)
       
    }
    drawScore();
    [...bats, ...explosions].forEach(obj => obj.update(deltaTime));
    [...bats, ...explosions].forEach(obj => obj.draw());
    bats = bats.filter(obj => !obj.markedForDeletion)
    explosions = explosions.filter(obj => !obj.markedForDeletion)
    
    if(!gameOver)requestAnimationFrame(animate)
    else drawGameOver()
}

animate(0)