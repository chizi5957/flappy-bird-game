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
    if (!gameStarted) startGame();
    if (!gameOver) bird.velocity = bird.jump;
  }
});

function startGame() {
  document.getElementById("startText").style.display = "none";
  pipes = [];
  bird.y = 200;
  bird.velocity = 0;
  score = 0;
  gameOver = false;
  gameStarted = true;
  loop();
}

function restartGame() {
  document.getElementById("gameOverPopup").style.display = "none";
  document.getElementById("startText").style.display = "block";
  gameStarted = false;
  draw(); // Draw initial frame with bird and background
}

function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawBird() {
  ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  for (let pipe of pipes) {
    let img = pipe.color === "green" ? pipeGreenImg : pipeRedImg;
    
    // Draw top pipe (cropped from bottom of original image)
    let topPipeHeight = pipe.top;
    let cropStartY = Math.max(0, img.height - topPipeHeight);
    ctx.drawImage(
      img,                    // source image
      0, cropStartY,          // source x, y (crop from bottom)
      img.width, topPipeHeight, // source width, height
      pipe.x, 0,              // destination x, y
      pipe.width, topPipeHeight // destination width, height
    );
    
    // Draw bottom pipe (cropped from top of original image)
    let bottomPipeHeight = canvas.height - pipe.top - gap;
    ctx.drawImage(
      img,                    // source image
      0, 0,                   // source x, y (crop from top)
      img.width, bottomPipeHeight, // source width, height
      pipe.x, pipe.top + gap, // destination x, y
      pipe.width, bottomPipeHeight // destination width, height
    );
  }
}

function showGameOver() {
  document.getElementById("finalScore").innerText = score;
  document.getElementById("finalBestScore").innerText = bestScore;
  document.getElementById("gameOverPopup").style.display = "block";
}

function draw() {
  drawBackground();
  drawPipes();
  drawBird();
}

function loop() {
  if (!gameStarted) return;
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
    
    // Draw pipes using cropping (same logic as drawPipes function)
    let img = p.color === "green" ? pipeGreenImg : pipeRedImg;
    
    // Draw top pipe (cropped from bottom of original image)
    let topPipeHeight = p.top;
    let cropStartY = Math.max(0, img.height - topPipeHeight);
    ctx.drawImage(
      img,                    // source image
      0, cropStartY,          // source x, y (crop from bottom)
      img.width, topPipeHeight, // source width, height
      p.x, 0,                 // destination x, y
      p.width, topPipeHeight  // destination width, height
    );
    
    // Draw bottom pipe (cropped from top of original image)
    let bottomPipeHeight = canvas.height - p.top - gap;
    ctx.drawImage(
      img,                    // source image
      0, 0,                   // source x, y (crop from top)
      img.width, bottomPipeHeight, // source width, height
      p.x, p.top + gap,       // destination x, y
      p.width, bottomPipeHeight // destination width, height
    );

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
