
let score = 0;
let started = false;
let pipes = [];
let hasClicked = false;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const scoreCounter = document.getElementById("scoreCounter");
const flapBtn = document.getElementById("flapButton");

canvas.width = 380;
canvas.height = 666;

document.getElementById("credits").style.width = `${(document.getElementById("body").offsetWidth - canvas.width) / 2}px`

jumpSound = new Audio("sounds/jump.wav")
gameOverSound = new Audio("sounds/punch.wav")

const bird = {
	width: 40,
	height: 28,
	x: 50,
	y: canvas.height / 2 - 28 / 2,
	sprite: new Image(),
	jumpStrength: 175,
	fallSpeed: 4,
	acceleration: 0,

	j_frames: 16,
	j_frame: 0,
	flap: function(){
		if(this.j_frame === 0){
			this.j_frame++; 
			jumpSound.play()}
		this.y -= this.jumpStrength / this.j_frames;
		this.acceleration = 0;
		started = true;
	},
	fall: function(){
		this.acceleration += 0.03;
		this.y += this.fallSpeed + this.acceleration;
	}
}

const base = {
	width: canvas.width,
	height: 100,
	x: 0,
	y: canvas.height - 100,
	sprite: new Image()
}

class Pipe{
	constructor(){
		this.spacing = 125;
		this.x = canvas.width;
		this.y = Math.ceil(Math.random() * (canvas.height - canvas.height / 6 * 3)) + canvas.height / 6;
		this.width = 80;
		this.height = 750;

		this.upSprite = new Image();
		this.upSprite.src = "images/pipe_up.png";
		this.downSprite = new Image();
		this.downSprite.src = "images/pipe_down.png";
	}

	drawAndMove(){
		this.x -= 5;
		ctx.drawImage(this.upSprite, this.x, (this.y - this.spacing - this.height), this.width, this.height)
		ctx.drawImage(this.downSprite, this.x, (this.y + this.spacing), this.width, this.height)
	}

	checkCollision(bird) {
		if (bird.x + bird.width >= this.x && bird.x <= this.x + this.width) {
			if (bird.y <= this.y - this.spacing) {
				return true;
			}
			if (bird.y + bird.height >= this.y + this.spacing) {
				return true;
			}
		}
		return false;
	}
	
	
}

bird.sprite.src = "images/bird.png";
base.sprite.src = "images/base.png"

const bg = new Image()
bg.src = "images/background.jpg";

function draw(bird){
	ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
	ctx.drawImage(bird.sprite, bird.x, bird.y, bird.width, bird.height)
	ctx.drawImage(base.sprite, base.x, base.y, base.width, base.height)

	pipes.forEach((element) => element.drawAndMove())
}

function update(bird, hasLoss){
	if(started){bird.fall()}

	if (bird.j_frame != 0){bird.flap();bird.j_frame++}

	if (bird.j_frame == bird.j_frames){bird.j_frame = 0}

	if (bird.y <= 0){bird.y = 0}

	if(bird.y + bird.height >= base.y){
		hasLoss = true;
		bird.y = base.y - bird.height;
	}

	for(let pipe of pipes){
		if (pipe.checkCollision(bird)){
			hasLoss = true;
		}
		if (bird.x == pipe.x){
			score ++;
			scoreCounter.textContent = score;
		}
	}

	document.getElementById("credits").style.width = `${(document.getElementById("body").offsetWidth - canvas.width) / 2}px`

	return [bird.x, bird.y, hasLoss]
}

function endScreen(){
	gameOverSound.play()
	clearInterval(pipeInterval)
	document.removeEventListener("keypress", makeFlap);
	document.addEventListener("keypress", retry);
	flapBtn.onclick = function(){retry({key: " "})};
}

function gameLoop(){
	let hasLoss = false;
	
	let [x, y, loss] = update(bird, hasLoss);
	draw(bird);

	bird.x = x;
	bird.y = y;
	hasLoss = loss;

	if(hasLoss === true){
		endScreen();
		return;
	}

	requestAnimationFrame(gameLoop)
}

function makeFlap(event){
	if(event.key == " " && !hasClicked){
		hasClicked = true;
		bird.j_frame = 0;
		bird.flap()
		setTimeout(function(){hasClicked = false}, 120)
	}
}

function retry(event){
	if(event.key == " "){
		score = 0;
		started = false;
		pipes = [];
		scoreCounter.textContent = 0;
		bird.y = canvas.height / 2 - 28 / 2
		bird.acceleration = 0;
		document.addEventListener("keypress", makeFlap)
		flapBtn.onclick = function(){makeFlap({key: " "})};
		document.removeEventListener("keypress", retry)
		pipeInterval = setInterval(spawnPipe, 1000)
		hasClicked = false
		gameLoop()
	}
}

function spawnPipe(){
	if (!started){return}

	pipes.push(new Pipe)
}

document.addEventListener("keypress", makeFlap)
flapBtn.onclick = function(){makeFlap({key: " "})};

pipeInterval = setInterval(spawnPipe, 1250)

gameLoop()