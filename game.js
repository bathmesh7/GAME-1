class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.overlay = document.getElementById("gameOverlay");
    this.startButton = document.getElementById("startButton");
    this.restartButton = document.getElementById("restartButton");

    // Game state
    this.gameRunning = false;
    this.gamePaused = false;
    this.score = 0;
    this.lives = 3;
    this.level = 1;

    // Game objects
    this.player = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      width: 40,
      height: 30,
      speed: 5,
      color: "#00ff88",
    };

    this.bullets = [];
    this.enemies = [];
    this.enemyBullets = [];
    this.particles = [];

    // Input handling
    this.keys = {};
    this.lastShot = 0;
    this.shotCooldown = 300; // milliseconds

    // Enemy spawning
    this.enemyRows = 4;
    this.enemiesPerRow = 8;
    this.enemySpeed = 1;
    this.enemyDirection = 1;
    this.enemyDropDistance = 20;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.spawnEnemies();
    this.updateUI();
    this.gameLoop();
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;

      if (e.code === "Space" && this.gameRunning) {
        e.preventDefault();
        this.shoot();
      }

      if (e.code === "KeyP" && this.gameRunning) {
        this.togglePause();
      }
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    // Button events
    this.startButton.addEventListener("click", () => {
      this.startGame();
    });

    this.restartButton.addEventListener("click", () => {
      this.restartGame();
    });
  }

  startGame() {
    this.gameRunning = true;
    this.overlay.classList.add("hidden");
    this.updateUI();
  }

  restartGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.enemySpeed = 1;
    this.spawnEnemies();
    this.gameRunning = true;
    this.gamePaused = false;
    this.overlay.classList.add("hidden");
    this.updateUI();
  }

  togglePause() {
    this.gamePaused = !this.gamePaused;
    if (this.gamePaused) {
      this.showOverlay("Game Paused", "Press P to resume");
    } else {
      this.overlay.classList.add("hidden");
    }
  }

  gameOver() {
    this.gameRunning = false;
    this.showOverlay("Game Over!", `Final Score: ${this.score}`, true);
  }

  showOverlay(title, message, showRestart = false) {
    document.getElementById("overlayTitle").textContent = title;
    document.getElementById("overlayMessage").textContent = message;
    this.startButton.style.display = showRestart ? "none" : "inline-block";
    this.restartButton.style.display = showRestart ? "inline-block" : "none";
    this.overlay.classList.remove("hidden");
  }

  spawnEnemies() {
    this.enemies = [];
    const enemyWidth = 40;
    const enemyHeight = 30;
    const spacing = 60;
    const startX = (this.canvas.width - (this.enemiesPerRow - 1) * spacing) / 2;
    const startY = 50;

    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemiesPerRow; col++) {
        this.enemies.push({
          x: startX + col * spacing,
          y: startY + row * (enemyHeight + 20),
          width: enemyWidth,
          height: enemyHeight,
          color: row === 0 ? "#ff4444" : row === 1 ? "#ff8844" : "#ffff44",
          points: (this.enemyRows - row) * 10,
        });
      }
    }
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShot < this.shotCooldown) return;

    this.bullets.push({
      x: this.player.x + this.player.width / 2 - 2,
      y: this.player.y,
      width: 4,
      height: 10,
      speed: 8,
      color: "#00ffff",
    });

    this.lastShot = now;
  }

  enemyShoot() {
    if (this.enemies.length === 0) return;

    const shooter =
      this.enemies[Math.floor(Math.random() * this.enemies.length)];
    this.enemyBullets.push({
      x: shooter.x + shooter.width / 2 - 2,
      y: shooter.y + shooter.height,
      width: 4,
      height: 10,
      speed: 3,
      color: "#ff4444",
    });
  }

  updatePlayer() {
    if (this.keys["ArrowLeft"] && this.player.x > 0) {
      this.player.x -= this.player.speed;
    }
    if (
      this.keys["ArrowRight"] &&
      this.player.x < this.canvas.width - this.player.width
    ) {
      this.player.x += this.player.speed;
    }
  }

  updateBullets() {
    // Update player bullets
    this.bullets = this.bullets.filter((bullet) => {
      bullet.y -= bullet.speed;
      return bullet.y > -bullet.height;
    });

    // Update enemy bullets
    this.enemyBullets = this.enemyBullets.filter((bullet) => {
      bullet.y += bullet.speed;
      return bullet.y < this.canvas.height;
    });
  }

  updateEnemies() {
    let shouldDrop = false;
    let shouldChangeDirection = false;

    // Check if enemies hit the edges
    this.enemies.forEach((enemy) => {
      if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
        shouldChangeDirection = true;
      }
    });

    if (shouldChangeDirection) {
      this.enemyDirection *= -1;
      shouldDrop = true;
    }

    // Move enemies
    this.enemies.forEach((enemy) => {
      enemy.x += this.enemySpeed * this.enemyDirection;
      if (shouldDrop) {
        enemy.y += this.enemyDropDistance;
      }
    });

    // Remove enemies that are too low
    this.enemies = this.enemies.filter(
      (enemy) => enemy.y < this.canvas.height - 100
    );

    // Random enemy shooting
    if (Math.random() < 0.01) {
      this.enemyShoot();
    }
  }

  checkCollisions() {
    // Player bullets vs enemies
    this.bullets.forEach((bullet, bulletIndex) => {
      this.enemies.forEach((enemy, enemyIndex) => {
        if (this.isColliding(bullet, enemy)) {
          this.score += enemy.points;
          this.createExplosion(
            enemy.x + enemy.width / 2,
            enemy.y + enemy.height / 2
          );
          this.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);
        }
      });
    });

    // Enemy bullets vs player
    this.enemyBullets.forEach((bullet, bulletIndex) => {
      if (this.isColliding(bullet, this.player)) {
        this.lives--;
        this.createExplosion(
          this.player.x + this.player.width / 2,
          this.player.y + this.player.height / 2
        );
        this.enemyBullets.splice(bulletIndex, 1);
        this.updateUI();

        if (this.lives <= 0) {
          this.gameOver();
        }
      }
    });

    // Enemies vs player
    this.enemies.forEach((enemy) => {
      if (this.isColliding(enemy, this.player)) {
        this.gameOver();
      }
    });
  }

  isColliding(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        color: "#ffff00",
      });
    }
  }

  updateParticles() {
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      return particle.life > 0;
    });
  }

  checkLevelComplete() {
    if (this.enemies.length === 0) {
      this.level++;
      this.enemySpeed += 0.5;
      this.spawnEnemies();
      this.updateUI();
    }
  }

  updateUI() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("lives").textContent = this.lives;
    document.getElementById("level").textContent = this.level;
  }

  drawPlayer() {
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height
    );

    // Draw player details
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(this.player.x + 5, this.player.y + 5, 30, 5);
    this.ctx.fillRect(this.player.x + 10, this.player.y + 15, 20, 10);
  }

  drawEnemies() {
    this.enemies.forEach((enemy) => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

      // Draw enemy details
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(enemy.x + 5, enemy.y + 5, 30, 5);
      this.ctx.fillRect(enemy.x + 10, enemy.y + 15, 20, 10);
    });
  }

  drawBullets() {
    this.bullets.forEach((bullet) => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    this.enemyBullets.forEach((bullet) => {
      this.ctx.fillStyle = bullet.color;
      this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  }

  drawParticles() {
    this.particles.forEach((particle) => {
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.life / 30;
      this.ctx.fillRect(particle.x, particle.y, 3, 3);
    });
    this.ctx.globalAlpha = 1;
  }

  clearCanvas() {
    this.ctx.fillStyle = "#000000";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  update() {
    if (!this.gameRunning || this.gamePaused) return;

    this.updatePlayer();
    this.updateBullets();
    this.updateEnemies();
    this.updateParticles();
    this.checkCollisions();
    this.checkLevelComplete();
  }

  draw() {
    this.clearCanvas();
    this.drawPlayer();
    this.drawEnemies();
    this.drawBullets();
    this.drawParticles();
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when the page loads
window.addEventListener("load", () => {
  new Game();
});
