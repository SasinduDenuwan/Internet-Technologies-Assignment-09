
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const speedElement = document.getElementById('speed');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

let score = 0;
let gameSpeed = 0;
let gameRunning = false;
let animationId;
let roadOffset = 0;
let opponentCars = [];
let lastOpponentSpawn = 0;
let opponentSpawnRate = 2000;

let level = 1;
let levelUpTimer = 0;
let levelUpMessage = '';

const maxLevel = 5;

const road = {
  width: canvas.width,
  draw() {
    ctx.fillStyle = '#6D7174';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 5;
    const dashHeight = 40;
    const gap = 30;
    const totalHeight = dashHeight + gap;

    for (let y = -totalHeight + (roadOffset % totalHeight); y < canvas.height; y += totalHeight) {
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, y);
      ctx.lineTo(canvas.width / 2, y + dashHeight);
      ctx.stroke();
    }
  }
};

const playerCar = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 100,
  width: 50,
  height: 80,
  speed: 2,
  maxSpeed: 10,
  color: '#3498db',
  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = '#2980b9';
    ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 20);
    ctx.fillRect(this.x + 5, this.y + 40, this.width - 10, 20);

    ctx.fillStyle = '#222';
    ctx.fillRect(this.x - 5, this.y + 10, 5, 20);
    ctx.fillRect(this.x - 5, this.y + 50, 5, 20);
    ctx.fillRect(this.x + this.width, this.y + 10, 5, 20);
    ctx.fillRect(this.x + this.width, this.y + 50, 5, 20);
  },
  update() {
    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
  }
};

function spawnOpponentCar() {
  const carTypes = [
    { width: 50, height: 80, color: '#e74c3c', speed: 3 + Math.random() * 2 },
    { width: 60, height: 100, color: '#f39c12', speed: 2 + Math.random() * 2 },
    { width: 40, height: 70, color: '#2ecc71', speed: 4 + Math.random() * 2 }
  ];
  const type = carTypes[Math.floor(Math.random() * carTypes.length)];

  opponentCars.push({
    x: Math.random() * (canvas.width - type.width),
    y: -type.height,
    width: type.width,
    height: type.height,
    speed: type.speed,
    color: type.color
  });
}

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  ArrowUp: false,
  ArrowDown: false
};

document.addEventListener('keydown', (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
    e.preventDefault();
  }
});

function update() {
  // Level speed up logic
  if (Date.now() - levelUpTimer > 10000 && level < maxLevel) {
    level++;
    playerCar.speed += 1;
    levelUpMessage = `Level ${level}`;
    levelUpTimer = Date.now();
    setTimeout(() => {
      levelUpMessage = '';
    }, 2000);
  }

  if (keys.ArrowLeft) playerCar.x -= 5;
  if (keys.ArrowRight) playerCar.x += 5;

  playerCar.update();
  roadOffset += playerCar.speed * 2;

  const now = Date.now();
  if (now - lastOpponentSpawn > opponentSpawnRate / (1 + playerCar.speed / 5)) {
    spawnOpponentCar();
    lastOpponentSpawn = now;
  }

  for (let i = opponentCars.length - 1; i >= 0; i--) {
    opponentCars[i].y += opponentCars[i].speed + playerCar.speed;

    if (opponentCars[i].y > canvas.height) {
      opponentCars.splice(i, 1);
      score += 10;
      scoreElement.textContent = score;
      continue;
    }

    if (checkCollision(playerCar, opponentCars[i])) {
      gameOver();
    }
  }

  gameSpeed = Math.floor(playerCar.speed * 20);
  speedElement.textContent = gameSpeed;
}

function checkCollision(car1, car2) {
  return car1.x < car2.x + car2.width &&
         car1.x + car1.width > car2.x &&
         car1.y < car2.y + car2.height &&
         car1.y + car1.height > car2.y;
}

function draw() {
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  road.draw();

  opponentCars.forEach(car => {
    ctx.fillStyle = car.color;
    ctx.fillRect(car.x, car.y, car.width, car.height);

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(car.x + 5, car.y + 10, car.width - 10, 20);
    ctx.fillRect(car.x + 5, car.y + 40, car.width - 10, 20);

    ctx.fillStyle = '#222';
    ctx.fillRect(car.x - 5, car.y + 10, 5, 20);
    ctx.fillRect(car.x - 5, car.y + 50, 5, 20);
    ctx.fillRect(car.x + car.width, car.y + 10, 5, 20);
    ctx.fillRect(car.x + car.width, car.y + 50, 5, 20);
  });

  playerCar.draw();

  // Draw level text
  if (levelUpMessage) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(levelUpMessage, canvas.width / 2, canvas.height / 2);
  }
}

function gameLoop() {
  if (!gameRunning) return;
  update();
  draw();
  animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
  score = 0;
  gameSpeed = 0;
  opponentCars = [];
  roadOffset = 0;
  level = 1;
  levelUpTimer = Date.now();
  levelUpMessage = '';

  playerCar.x = canvas.width / 2 - 25;
  playerCar.y = canvas.height - 100;
  playerCar.speed = 2;

  scoreElement.textContent = score;
  speedElement.textContent = gameSpeed;

  startScreen.style.display = 'none';
  gameOverScreen.style.display = 'none';

  gameRunning = true;
  lastOpponentSpawn = Date.now();
  gameLoop();
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  finalScoreElement.textContent = score;
  gameOverScreen.style.display = 'block';
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

draw();