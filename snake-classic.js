const canvas = document.getElementById("snakeCanvas");
const ctx = canvas.getContext("2d");
const box = 20; // size of one grid square
const rows = canvas.height / box;
const cols = canvas.width / box;

let snake = [{ x: 9, y: 9 }];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let apple = spawnApple();
let score = 0;
let gameOver = false;
let moveInterval = 120;
let moveTimer;

draw();
document.addEventListener("keydown", handleKey);

function handleKey(e) {
  if (gameOver && e.code === "Space") {
    restart();
    return;
  }
  if (e.code === "ArrowUp" && direction !== "DOWN") nextDirection = "UP";
  else if (e.code === "ArrowDown" && direction !== "UP") nextDirection = "DOWN";
  else if (e.code === "ArrowLeft" && direction !== "RIGHT")
    nextDirection = "LEFT";
  else if (e.code === "ArrowRight" && direction !== "LEFT")
    nextDirection = "RIGHT";
}

function gameLoop() {
  if (gameOver) return;
  direction = nextDirection;
  const head = { ...snake[0] };
  if (direction === "UP") head.y--;
  else if (direction === "DOWN") head.y++;
  else if (direction === "LEFT") head.x--;
  else if (direction === "RIGHT") head.x++;

  // Wall collision
  if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
    endGame();
    return;
  }
  // Self collision
  if (snake.some((seg) => seg.x === head.x && seg.y === head.y)) {
    endGame();
    return;
  }
  snake.unshift(head);
  // Apple eaten
  if (head.x === apple.x && head.y === apple.y) {
    score++;
    document.getElementById("score").textContent = score;
    apple = spawnApple();
  } else {
    snake.pop();
  }
  draw();
  moveTimer = setTimeout(gameLoop, moveInterval);
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw apple
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(
    apple.x * box + box / 2,
    apple.y * box + box / 2,
    box / 2 - 2,
    0,
    2 * Math.PI
  );
  ctx.fill();
  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#228B22" : "#4CAF50";
    ctx.fillRect(snake[i].x * box, snake[i].y * box, box, box);
    ctx.strokeStyle = "#111";
    ctx.strokeRect(snake[i].x * box, snake[i].y * box, box, box);
  }
}

function spawnApple() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows),
    };
  } while (snake.some((seg) => seg.x === pos.x && seg.y === pos.y));
  return pos;
}

function endGame() {
  gameOver = true;
  document.getElementById("gameOverMsg").style.display = "";
}

function restart() {
  snake = [{ x: 9, y: 9 }];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  apple = spawnApple();
  score = 0;
  document.getElementById("score").textContent = score;
  gameOver = false;
  document.getElementById("gameOverMsg").style.display = "none";
  clearTimeout(moveTimer);
  draw();
  moveTimer = setTimeout(gameLoop, moveInterval);
}

// Start the game
moveTimer = setTimeout(gameLoop, moveInterval);
