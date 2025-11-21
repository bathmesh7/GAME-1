class TypingGame {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.overlay = document.getElementById("gameOverlay");
    this.startButton = document.getElementById("startButton");
    this.restartButton = document.getElementById("restartButton");
    this.wordInput = document.getElementById("wordInput");
    this.currentWordDisplay = document.getElementById("currentWord");

    // Game state
    this.gameRunning = false;
    this.score = 0;
    this.level = 1;
    this.wordsTyped = 0;

    // Game objects
    this.fighterJet = {
      x: this.canvas.width / 2,
      y: this.canvas.height - 50,
      width: 40,
      height: 30,
      speed: 5,
    };

    this.astronauts = [];
    this.bullets = [];
    this.particles = [];

    // Word list
    this.words = [
      "GAME",
      "PLAY",
      "FUN",
      "CODE",
      "WEB",
      "HTML",
      "CSS",
      "JS",
      "TYPE",
      "FAST",
      "SHOOT",
      "SPACE",
      "STAR",
      "PLANET",
      "ROCKET",
      "ALIEN",
      "EARTH",
      "MOON",
      "SUN",
      "GALAXY",
      "UNIVERSE",
    ];

    this.currentTargetWord = "";
    this.astronautSpawnRate = 2000; // milliseconds
    this.lastSpawn = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.gameLoop();
  }

  setupEventListeners() {
    this.startButton.addEventListener("click", () => {
      this.startGame();
    });

    this.restartButton.addEventListener("click", () => {
      this.restartGame();
    });

    this.wordInput.addEventListener("input", (e) => {
      this.handleTyping(e.target.value);
    });

    this.wordInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.submitWord();
      }
    });

    // Keyboard controls for fighter jet
    document.addEventListener("keydown", (e) => {
      if (!this.gameRunning) return;

      if (e.code === "ArrowLeft" && this.fighterJet.x > 0) {
        this.fighterJet.x -= this.fighterJet.speed;
      }
      if (
        e.code === "ArrowRight" &&
        this.fighterJet.x < this.canvas.width - this.fighterJet.width
      ) {
        this.fighterJet.x += this.fighterJet.speed;
      }
    });
  }

  startGame() {
    this.gameRunning = true;
    this.overlay.classList.add("hidden");
    this.wordInput.disabled = false;
    this.wordInput.focus();
    this.updateUI();
  }

  restartGame() {
    this.score = 0;
    this.level = 1;
    this.wordsTyped = 0;
    this.astronauts = [];
    this.bullets = [];
    this.particles = [];
    this.currentTargetWord = "";
    this.astronautSpawnRate = 2000;
    this.gameRunning = true;
    this.overlay.classList.add("hidden");
    this.wordInput.disabled = false;
    this.wordInput.focus();
    this.updateUI();
  }

  handleTyping(input) {
    if (!this.gameRunning) return;

    // Check if input matches any astronaut's word
    const matchingAstronaut = this.astronauts.find((astronaut) =>
      astronaut.word.toLowerCase().startsWith(input.toLowerCase())
    );

    if (matchingAstronaut) {
      this.currentTargetWord = matchingAstronaut.word;
      this.currentWordDisplay.textContent = `Target: ${this.currentTargetWord}`;
    } else {
      this.currentTargetWord = "";
      this.currentWordDisplay.textContent = "Type a word to shoot!";
    }
  }

  submitWord() {
    if (!this.gameRunning || !this.currentTargetWord) return;

    const input = this.wordInput.value.trim().toLowerCase();
    const target = this.currentTargetWord.toLowerCase();

    if (input === target) {
      // Find and destroy the astronaut
      const astronautIndex = this.astronauts.findIndex(
        (a) => a.word.toLowerCase() === target
      );

      if (astronautIndex !== -1) {
        const astronaut = this.astronauts[astronautIndex];
        this.createExplosion(
          astronaut.x + astronaut.width / 2,
          astronaut.y + astronaut.height / 2
        );
        this.astronauts.splice(astronautIndex, 1);

        this.score += 100 * this.level;
        this.wordsTyped++;

        // Level up every 5 words
        if (this.wordsTyped % 5 === 0) {
          this.level++;
          this.astronautSpawnRate = Math.max(
            500,
            this.astronautSpawnRate - 200
          );
        }

        this.updateUI();
      }
    }

    this.wordInput.value = "";
    this.currentTargetWord = "";
    this.currentWordDisplay.textContent = "Type a word to shoot!";
  }

  spawnAstronaut() {
    const word = this.words[Math.floor(Math.random() * this.words.length)];
    const astronaut = {
      x: Math.random() * (this.canvas.width - 60),
      y: -50,
      width: 40,
      height: 40,
      word: word,
      speed: 1 + Math.random() * 2,
    };

    this.astronauts.push(astronaut);
  }

  createExplosion(x, y) {
    for (let i = 0; i < 10; i++) {
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

  updateAstronauts() {
    this.astronauts.forEach((astronaut, index) => {
      astronaut.y += astronaut.speed;

      // Remove astronauts that go off screen
      if (astronaut.y > this.canvas.height) {
        this.astronauts.splice(index, 1);
      }
    });
  }

  updateParticles() {
    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      return particle.life > 0;
    });
  }

  drawFighterJet() {
    this.ctx.fillStyle = "#00ff88";
    this.ctx.fillRect(
      this.fighterJet.x,
      this.fighterJet.y,
      this.fighterJet.width,
      this.fighterJet.height
    );

    // Draw jet details
    this.ctx.fillStyle = "#ffffff";
    this.ctx.fillRect(this.fighterJet.x + 5, this.fighterJet.y + 5, 30, 5);
    this.ctx.fillRect(this.fighterJet.x + 10, this.fighterJet.y + 15, 20, 10);
  }

  drawAstronauts() {
    this.astronauts.forEach((astronaut) => {
      // Draw astronaut
      this.ctx.fillStyle = "#ff4444";
      this.ctx.fillRect(
        astronaut.x,
        astronaut.y,
        astronaut.width,
        astronaut.height
      );

      // Draw word bubble
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      this.ctx.fillRect(
        astronaut.x - 10,
        astronaut.y - 30,
        astronaut.width + 20,
        25
      );

      // Draw word
      this.ctx.fillStyle = "#000";
      this.ctx.font = "12px Orbitron";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        astronaut.word,
        astronaut.x + astronaut.width / 2,
        astronaut.y - 15
      );
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
    if (!this.gameRunning) return;

    // Spawn astronauts
    const now = Date.now();
    if (now - this.lastSpawn > this.astronautSpawnRate) {
      this.spawnAstronaut();
      this.lastSpawn = now;
    }

    this.updateAstronauts();
    this.updateParticles();

    // Check game over condition
    if (this.astronauts.length >= 10) {
      this.gameOver();
    }
  }

  draw() {
    this.clearCanvas();
    this.drawFighterJet();
    this.drawAstronauts();
    this.drawParticles();
  }

  gameOver() {
    this.gameRunning = false;
    this.wordInput.disabled = true;
    this.showOverlay(
      "Game Over!",
      `Final Score: ${this.score} | Words Typed: ${this.wordsTyped}`,
      true
    );
    this.updateUserScore();
  }

  showOverlay(title, message, showRestart = false) {
    document.getElementById("overlayTitle").textContent = title;
    document.getElementById("overlayMessage").textContent = message;
    this.startButton.style.display = showRestart ? "none" : "inline-block";
    this.restartButton.style.display = showRestart ? "inline-block" : "none";
    this.overlay.classList.remove("hidden");
  }

  updateUI() {
    document.getElementById("score").textContent = this.score;
    document.getElementById("level").textContent = this.level;
    document.getElementById("wordsTyped").textContent = this.wordsTyped;
  }

  updateUserScore() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      currentUser.score += this.score;
      currentUser.gamesPlayed++;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));

      // Update user in users array
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const userIndex = users.findIndex((u) => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem("users", JSON.stringify(users));
      }
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Initialize the game
new TypingGame();
