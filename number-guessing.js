class NumberGuessingGame {
  constructor() {
    this.currentNumber = null;
    this.score = 0;
    this.lives = 5;
    this.correctGuesses = 0;
    this.gameRunning = false;
    this.overlay = document.getElementById("gameOverlay");
    this.startButton = document.getElementById("startButton");
    this.restartButton = document.getElementById("restartButton");
    this.guessInput = document.getElementById("guessInput");
    this.submitButton = document.getElementById("submitGuess");
    this.currentNumberDisplay = document.getElementById("currentNumber");
    this.livesDisplay = document.getElementById("lives");
    this.livesHearts = document.getElementById("livesHearts");
    this.scoreDisplay = document.getElementById("score");
    this.correctDisplay = document.getElementById("correct");
    this.hintDisplay = document.getElementById("hint");

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    this.startButton.addEventListener("click", () => {
      this.startGame();
    });

    this.restartButton.addEventListener("click", () => {
      this.restartGame();
    });

    this.submitButton.addEventListener("click", () => {
      this.submitGuess();
    });

    this.guessInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.submitGuess();
      }
    });
  }

  startGame() {
    this.gameRunning = true;
    this.overlay.classList.add("hidden");
    this.generateNewNumber();
    this.updateUI();
    this.guessInput.focus();
  }

  restartGame() {
    this.score = 0;
    this.lives = 5;
    this.correctGuesses = 0;
    this.gameRunning = true;
    this.overlay.classList.add("hidden");
    this.generateNewNumber();
    this.updateUI();
    this.guessInput.focus();
  }

  generateNewNumber() {
    this.currentNumber = Math.floor(Math.random() * 10) + 1;
    this.currentNumberDisplay.textContent = "?";
    this.hintDisplay.textContent = "Guess the number!";
    this.guessInput.value = "";
    this.guessInput.disabled = false;
    this.submitButton.disabled = false;
  }

  submitGuess() {
    if (!this.gameRunning) return;

    const guess = parseInt(this.guessInput.value);

    if (isNaN(guess) || guess < 1 || guess > 10) {
      this.showHint("Please enter a number between 1 and 10!", "error");
      return;
    }

    this.guessInput.disabled = true;
    this.submitButton.disabled = true;

    if (guess === this.currentNumber) {
      this.handleCorrectGuess();
    } else {
      this.handleIncorrectGuess(guess);
    }
  }

  handleCorrectGuess() {
    this.score += 10;
    this.correctGuesses++;
    this.currentNumberDisplay.textContent = this.currentNumber;
    this.showHint(`Correct! The number was ${this.currentNumber}`, "success");
    this.numberCircle.classList.add("correct-animation");

    setTimeout(() => {
      this.numberCircle.classList.remove("correct-animation");
    }, 500);

    setTimeout(() => {
      if (this.correctGuesses >= 5) {
        this.gameWon();
      } else {
        this.generateNewNumber();
        this.updateUI();
      }
    }, 2000);
  }

  handleIncorrectGuess(guess) {
    this.lives--;
    this.currentNumberDisplay.textContent = this.currentNumber;
    this.showHint(
      `Wrong! The number was ${this.currentNumber}. Your guess: ${guess}`,
      "error"
    );
    this.numberCircle.classList.add("incorrect-animation");

    setTimeout(() => {
      this.numberCircle.classList.remove("incorrect-animation");
    }, 300);

    setTimeout(() => {
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.generateNewNumber();
        this.updateUI();
      }
    }, 2000);
  }

  showHint(message, type) {
    this.hintDisplay.textContent = message;
    this.hintDisplay.style.color = type === "success" ? "#00ff88" : "#ff4444";

    // Reset color after 2 seconds
    setTimeout(() => {
      this.hintDisplay.style.color = "#ccc";
    }, 2000);
  }

  gameWon() {
    this.gameRunning = false;
    this.showOverlay(
      "🎉 Congratulations! 🎉",
      `You won! Final Score: ${this.score}`,
      true
    );
    this.updateUserScore();
  }

  gameOver() {
    this.gameRunning = false;
    this.showOverlay(
      "Game Over!",
      `Final Score: ${this.score} | Correct Guesses: ${this.correctGuesses}`,
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
    this.scoreDisplay.textContent = this.score;
    this.livesDisplay.textContent = this.lives;
    this.correctDisplay.textContent = this.correctGuesses;

    // Update hearts display
    const hearts = "❤️".repeat(this.lives) + "🖤".repeat(5 - this.lives);
    this.livesHearts.textContent = hearts;
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

  get numberCircle() {
    return document.querySelector(".number-circle");
  }
}

// Initialize the game
new NumberGuessingGame();
