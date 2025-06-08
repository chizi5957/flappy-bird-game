const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const birdImg = new Image();
birdImg.src = "https://i.postimg.cc/sQ64YzJ3/bird.png";
const pipeGreenImg = new Image();
pipeGreenImg.src = "https://i.postimg.cc/xc7FrvM9/pipe-green.png";
const pipeRedImg = new Image();
pipeRedImg.src = "https://i.postimg.cc/v4V2G4tf/pipe-red.png";
const bgImg = new Image();
bgImg.src = "https://i.postimg.cc/J4M5r2TJ/cartoon-sweet-pink-lollipop-candy-world-3d-rendered-picture.jpg";

let bird = { x: 150, y: 200, width: 40, height: 40, velocity: 0, gravity: 0.2, jump: -5 };
let pipes = [];
let gameStarted = false, gameOver = false, score = 0, bestScore = 0;
let gap = 160;
let frame = 0;

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault(); // Prevent default space bar behavior
    
    if (!gameStarted && !gameOver) {
      // Start the game only if we're in the initial state
      startGame();
    } else if (gameOver) {
      // If game is over, restart the game
      restartGame();
    } else if (gameStarted && !gameOver) {
      // If game is running, make the bird jump
      bird.velocity = bird.jump;
    }
  }
});

function startGame() {
  document.getElementById("startText").style.display = "none";
  pipes = [];
  bird.y = 200;
  bird.velocity = 0;
  score = 0;
  frame = 0;
  gameOver = false;
  gameStarted = true;
  
  // Update score display immediately
  document.getElementById("score").innerText = score;
  
  loop();
}

function restartGame() {
  // Hide game over popup
  document.getElementById("gameOverPopup").style.display = "none";
  
  // Show start text
  document.getElementById("startText").style.display = "block";
  
  // Reset game state
  gameStarted = false;
  gameOver = false;
  pipes = [];
  bird.y = 200;
  bird.velocity = 0;
  score = 0;
  frame = 0;
  
  // Update score display immediately
  document.getElementById("score").innerText = score;
  
  // Draw initial frame with bird and background
  draw();
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawTiledPipe(img, x, y, width, height, fromBottom = false) {
  if (!img.complete || img.height === 0) return;
  
  let currentY = y;
  let remainingHeight = height;
  
  while (remainingHeight > 0) {
    let tileHeight = Math.min(remainingHeight, img.height);
    let sourceY = 0;
    
    if (fromBottom && remainingHeight === height) {
      // For the first tile when drawing from bottom, crop from the bottom of the image
      sourceY = Math.max(0, img.height - tileHeight);
    }
    
    ctx.drawImage(
      img,                    // source image
      0, sourceY,             // source x, y
      img.width, tileHeight,  // source width, height
      x, currentY,            // destination x, y
      width, tileHeight       // destination width, height
    );
    
    currentY += tileHeight;
    remainingHeight -= tileHeight;
  }
}

function drawPipes() {
  for (let pipe of pipes) {
    let img = pipe.color === "green" ? pipeGreenImg : pipeRedImg;
    
    // Draw top pipe (tiled, aligned to bottom)
    let topPipeHeight = pipe.top;
    drawTiledPipe(img, pipe.x, 0, pipe.width, topPipeHeight, true);
    
    // Draw bottom pipe (tiled, aligned to top)
    let bottomPipeHeight = canvas.height - pipe.top - gap;
    drawTiledPipe(img, pipe.x, pipe.top + gap, pipe.width, bottomPipeHeight, false);
  }
}

function showGameOver() {
  document.getElementById("finalScore").innerText = score;
  document.getElementById("finalBestScore").innerText = bestScore;
  document.getElementById("gameOverPopup").style.display = "block";
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawPipes();
  drawBird();
}

function loop() {
  if (!gameStarted || gameOver) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  bird.velocity += bird.gravity;
  bird.y += bird.velocity;
  drawBird();

  if (frame % 120 === 0) {
    let top = Math.floor(Math.random() * 250) + 50;
    let color = Math.random() > 0.5 ? "green" : "red";
    pipes.push({ x: canvas.width, width: 60, top, color, passed: false });
  }

  for (let i = 0; i < pipes.length; i++) {
    let p = pipes[i];
    p.x -= 2;
    
    // Draw pipes using tiling
    let img = p.color === "green" ? pipeGreenImg : pipeRedImg;
    
    // Draw top pipe (tiled, aligned to bottom)
    let topPipeHeight = p.top;
    drawTiledPipe(img, p.x, 0, p.width, topPipeHeight, true);
    
    // Draw bottom pipe (tiled, aligned to top)
    let bottomPipeHeight = canvas.height - p.top - gap;
    drawTiledPipe(img, p.x, p.top + gap, p.width, bottomPipeHeight, false);

    if (!p.passed && p.x + p.width < bird.x) {
      score++;
      p.passed = true;
      if (score > bestScore) bestScore = score;
      document.getElementById("score").innerText = score;
      document.getElementById("bestScore").innerText = bestScore;
    }

    if (
      bird.x < p.x + p.width &&
      bird.x + bird.width > p.x &&
      (bird.y < p.top || bird.y + bird.height > p.top + gap)
    ) {
      gameOver = true;
    }
  }

  pipes = pipes.filter(p => p.x + p.width > 0);

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver = true;
  }

  if (gameOver) {
    showGameOver();
    gameStarted = false;
    return;
  }

  frame++;
  requestAnimationFrame(loop);
}

// Initial draw to show background and bird
draw();
