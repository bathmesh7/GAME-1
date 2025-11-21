class CarRacingGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.gameActive = false;
    this.gamePaused = false;

    // Game state
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.speed = 0;
    this.maxSpeed = 200;

    // Player car
    this.car = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 100,
      width: 40,
      height: 60,
      speed: 5,
    };

    // Game objects
    this.obstacles = [];
    this.powerUps = [];
    this.particles = [];

    // Controls
    this.keys = {
      left: false,
      right: false,
      up: false,
      down: false,
      space: false,
    };

    // Game settings
    this.obstacleSpeed = 3;
    this.powerUpSpeed = 2;
    this.obstacleSpawnRate = 0.02;
    this.powerUpSpawnRate = 0.005;

    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.updateDisplay();
    this.showStartScreen();
  }

  showStartScreen() {
    document.getElementById("game-overlay").classList.remove("hidden");
  }

  startGame() {
    this.gameActive = true;
    this.gamePaused = false;
    this.score = 0;
    this.level = 1;
    this.lives = 3;
    this.speed = 0;
    this.obstacles = [];
    this.powerUps = [];
    this.particles = [];

    document.getElementById("game-overlay").classList.add("hidden");
    document.getElementById("pause-overlay").classList.add("hidden");

    this.gameLoop();
  }

  gameLoop() {
    if (!this.gameActive || this.gamePaused) return;

    this.update();
    this.render();

    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    this.updateCar();
    this.updateObstacles();
    this.updatePowerUps();
    this.updateParticles();
    this.checkCollisions();
    this.updateScore();
    this.updateLevel();
  }

  updateCar() {
    // Handle car movement
    if (this.keys.left && this.car.x > 0) {
      this.car.x -= this.car.speed;
    }
    if (this.keys.right && this.car.x < this.canvas.width - this.car.width) {
      this.car.x += this.car.speed;
    }
    if (this.keys.up && this.car.y > 0) {
      this.car.y -= this.car.speed;
    }
    if (this.keys.down && this.car.y < this.canvas.height - this.car.height) {
      this.car.y += this.car.speed;
    }

    // Boost with spacebar
    if (this.keys.space && this.speed < this.maxSpeed) {
      this.speed += 2;
    } else if (this.speed > 0) {
      this.speed -= 0.5;
    }
  }

  updateObstacles() {
    // Move obstacles
    this.obstacles.forEach((obstacle) => {
      obstacle.y += this.obstacleSpeed + this.speed * 0.1;
    });

    // Remove obstacles that are off screen
    this.obstacles = this.obstacles.filter(
      (obstacle) => obstacle.y < this.canvas.height
    );

    // Spawn new obstacles
    if (Math.random() < this.obstacleSpawnRate) {
      this.spawnObstacle();
    }
  }

  updatePowerUps() {
    // Move power-ups
    this.powerUps.forEach((powerUp) => {
      powerUp.y += this.powerUpSpeed + this.speed * 0.05;
    });

    // Remove power-ups that are off screen
    this.powerUps = this.powerUps.filter(
      (powerUp) => powerUp.y < this.canvas.height
    );

    // Spawn new power-ups
    if (Math.random() < this.powerUpSpawnRate) {
      this.spawnPowerUp();
    }
  }

  updateParticles() {
    // Update particle positions
    this.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 1;
    });

    // Remove dead particles
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  spawnObstacle() {
    const obstacle = {
      x: Math.random() * (this.canvas.width - 60),
      y: -60,
      width: 60,
      height: 60,
      type: Math.random() < 0.5 ? "car" : "truck",
    };
    this.obstacles.push(obstacle);
  }

  spawnPowerUp() {
    const powerUp = {
      x: Math.random() * (this.canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      type: Math.random() < 0.7 ? "star" : "shield",
    };
    this.powerUps.push(powerUp);
  }

  checkCollisions() {
    // Check car-obstacle collisions
    this.obstacles.forEach((obstacle, index) => {
      if (this.checkCollision(this.car, obstacle)) {
        this.handleCollision(obstacle);
        this.obstacles.splice(index, 1);
      }
    });

    // Check car-powerUp collisions
    this.powerUps.forEach((powerUp, index) => {
      if (this.checkCollision(this.car, powerUp)) {
        this.handlePowerUp(powerUp);
        this.powerUps.splice(index, 1);
      }
    });
  }

  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  handleCollision(obstacle) {
    this.lives--;
    this.createExplosion(
      this.car.x + this.car.width / 2,
      this.car.y + this.car.height / 2
    );

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.showMessage("💥 Crash! Lives remaining: " + this.lives);
    }

    this.updateDisplay();
  }

  handlePowerUp(powerUp) {
    if (powerUp.type === "star") {
      this.score += 50;
      this.showMessage("⭐ +50 points!");
    } else if (powerUp.type === "shield") {
      this.lives = Math.min(this.lives + 1, 5);
      this.showMessage("🛡️ +1 life!");
    }

    this.createPowerUpEffect(
      powerUp.x + powerUp.width / 2,
      powerUp.y + powerUp.height / 2
    );
    this.updateDisplay();
  }

  createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        color: "#ff6b6b",
      });
    }
  }

  createPowerUpEffect(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 20,
        color: "#00ffff",
      });
    }
  }

  updateScore() {
    this.score += Math.floor(this.speed * 0.1);
  }

  updateLevel() {
    const newLevel = Math.floor(this.score / 1000) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.obstacleSpeed += 0.5;
      this.obstacleSpawnRate += 0.005;
      this.showMessage(`🚀 Level ${this.level}! Speed increased!`);
    }
  }

  gameOver() {
    this.gameActive = false;

    const overlay = document.getElementById("game-overlay");
    const title = document.getElementById("overlay-title");
    const message = document.getElementById("overlay-message");
    const startBtn = document.getElementById("start-btn");

    title.textContent = "Game Over!";
    message.textContent = `Final Score: ${this.score}\nLevel Reached: ${this.level}`;
    startBtn.textContent = "Play Again";

    overlay.classList.remove("hidden");
  }

  render() {
    // Clear canvas
    this.ctx.fillStyle = "#1a1a1a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw road
    this.drawRoad();

    // Draw car
    this.drawCar();

    // Draw obstacles
    this.obstacles.forEach((obstacle) => this.drawObstacle(obstacle));

    // Draw power-ups
    this.powerUps.forEach((powerUp) => this.drawPowerUp(powerUp));

    // Draw particles
    this.particles.forEach((particle) => this.drawParticle(particle));

    // Draw UI
    this.drawUI();
  }

  drawRoad() {
    // Draw road background
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw road lines
    this.ctx.strokeStyle = "#fff";
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 20]);

    for (let i = 0; i < this.canvas.width; i += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.canvas.height);
      this.ctx.stroke();
    }

    this.ctx.setLineDash([]);
  }

  drawCar() {
    // Car body
    this.ctx.fillStyle = "#ff6b6b";
    this.ctx.fillRect(this.car.x, this.car.y, this.car.width, this.car.height);

    // Car details
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(this.car.x + 5, this.car.y + 5, this.car.width - 10, 10);
    this.ctx.fillRect(
      this.car.x + 5,
      this.car.y + this.car.height - 15,
      this.car.width - 10,
      10
    );

    // Headlights
    this.ctx.fillStyle = "#ffff00";
    this.ctx.fillRect(this.car.x + 5, this.car.y + this.car.height - 5, 8, 5);
    this.ctx.fillRect(
      this.car.x + this.car.width - 13,
      this.car.y + this.car.height - 5,
      8,
      5
    );
  }

  drawObstacle(obstacle) {
    if (obstacle.type === "car") {
      this.ctx.fillStyle = "#4caf50";
      this.ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    } else {
      this.ctx.fillStyle = "#2196f3";
      this.ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );
    }

    // Obstacle details
    this.ctx.fillStyle = "#333";
    this.ctx.fillRect(obstacle.x + 5, obstacle.y + 5, obstacle.width - 10, 10);
  }

  drawPowerUp(powerUp) {
    if (powerUp.type === "star") {
      this.ctx.fillStyle = "#ffeb3b";
      this.drawStar(
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2,
        15
      );
    } else {
      this.ctx.fillStyle = "#00ffff";
      this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    }
  }

  drawStar(x, y, size) {
    this.ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5;
      const px = x + size * Math.cos(angle);
      const py = y + size * Math.sin(angle);
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  drawParticle(particle) {
    this.ctx.fillStyle = particle.color;
    this.ctx.globalAlpha = particle.life / 30;
    this.ctx.fillRect(particle.x, particle.y, 3, 3);
    this.ctx.globalAlpha = 1;
  }

  drawUI() {
    // Draw speed indicator
    this.ctx.fillStyle = "#00ffff";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`Speed: ${Math.floor(this.speed)} km/h`, 10, 30);

    // Draw score
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "24px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 10, 60);

    // Draw level
    this.ctx.fillStyle = "#ffeb3b";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`Level: ${this.level}`, 10, 90);
  }

  showMessage(message) {
    // Create temporary message display
    const messageDiv = document.createElement("div");
    messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 10px;
            border: 2px solid #00ffff;
            z-index: 1000;
            font-size: 1.2rem;
            text-align: center;
        `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 2000);
  }

  updateDisplay() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("level").textContent = this.level;
    document.getElementById("lives").textContent = this.lives;
    document.getElementById("speed").textContent = `${Math.floor(
      this.speed
    )} km/h`;

    // Add speed animation
    const speedElement = document.getElementById("speed");
    if (this.speed > 100) {
      speedElement.classList.add("speed-high");
    } else {
      speedElement.classList.remove("speed-high");
    }
  }

  setupEventListeners() {
    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.gameActive || this.gamePaused) return;

      switch (e.key) {
        case "ArrowLeft":
          this.keys.left = true;
          e.preventDefault();
          break;
        case "ArrowRight":
          this.keys.right = true;
          e.preventDefault();
          break;
        case "ArrowUp":
          this.keys.up = true;
          e.preventDefault();
          break;
        case "ArrowDown":
          this.keys.down = true;
          e.preventDefault();
          break;
        case " ":
          this.keys.space = true;
          e.preventDefault();
          break;
        case "Escape":
          this.togglePause();
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "ArrowRight":
          this.keys.right = false;
          break;
        case "ArrowUp":
          this.keys.up = false;
          break;
        case "ArrowDown":
          this.keys.down = false;
          break;
        case " ":
          this.keys.space = false;
          break;
      }
    });

    // Mobile controls
    document
      .getElementById("left-btn")
      .addEventListener("mousedown", () => (this.keys.left = true));
    document
      .getElementById("left-btn")
      .addEventListener("mouseup", () => (this.keys.left = false));
    document
      .getElementById("left-btn")
      .addEventListener("touchstart", () => (this.keys.left = true));
    document
      .getElementById("left-btn")
      .addEventListener("touchend", () => (this.keys.left = false));

    document
      .getElementById("right-btn")
      .addEventListener("mousedown", () => (this.keys.right = true));
    document
      .getElementById("right-btn")
      .addEventListener("mouseup", () => (this.keys.right = false));
    document
      .getElementById("right-btn")
      .addEventListener("touchstart", () => (this.keys.right = true));
    document
      .getElementById("right-btn")
      .addEventListener("touchend", () => (this.keys.right = false));

    // Game controls
    document.getElementById("start-btn").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("pause-btn").addEventListener("click", () => {
      this.togglePause();
    });

    document.getElementById("resume-btn").addEventListener("click", () => {
      this.togglePause();
    });

    document.getElementById("back-btn").addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

    // Prevent context menu on canvas
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  togglePause() {
    if (!this.gameActive) return;

    this.gamePaused = !this.gamePaused;

    if (this.gamePaused) {
      document.getElementById("pause-overlay").classList.remove("hidden");
    } else {
      document.getElementById("pause-overlay").classList.add("hidden");
      this.gameLoop();
    }
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new CarRacingGame();
});
