class TicTacToe2Player {
  constructor() {
    this.board = Array(9).fill("");
    this.currentPlayer = 1; // 1 for X, 2 for O
    this.gameActive = false;
    this.playerScores = { 1: 0, 2: 0 };
    this.gamesPlayed = 0;
    this.winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // Columns
      [0, 4, 8],
      [2, 4, 6], // Diagonals
    ];

    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.renderBoard();
    this.updateDisplay();
  }

  renderBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = i;

      if (this.board[i] === "X") {
        cell.textContent = "❌";
        cell.classList.add("x");
      } else if (this.board[i] === "O") {
        cell.textContent = "⭕";
        cell.classList.add("o");
      }

      cell.addEventListener("click", () => this.handleCellClick(i));
      gameBoard.appendChild(cell);
    }
  }

  handleCellClick(index) {
    if (!this.gameActive || this.board[index] !== "") return;

    const symbol = this.currentPlayer === 1 ? "X" : "O";
    this.board[index] = symbol;

    // Update the cell
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = symbol === "X" ? "❌" : "⭕";
    cell.classList.add(symbol.toLowerCase());

    // Check for win or draw
    if (this.checkWin()) {
      this.handleWin();
    } else if (this.checkDraw()) {
      this.handleDraw();
    } else {
      this.switchPlayer();
    }
  }

  checkWin() {
    for (const combination of this.winningCombinations) {
      const [a, b, c] = combination;
      if (
        this.board[a] &&
        this.board[a] === this.board[b] &&
        this.board[a] === this.board[c]
      ) {
        // Highlight winning cells
        combination.forEach((index) => {
          const cell = document.querySelector(`[data-index="${index}"]`);
          cell.classList.add("winning");
        });
        return true;
      }
    }
    return false;
  }

  checkDraw() {
    return this.board.every((cell) => cell !== "");
  }

  handleWin() {
    this.gameActive = false;
    this.playerScores[this.currentPlayer]++;
    this.gamesPlayed++;

    const winner = this.currentPlayer === 1 ? "Player 1 (❌)" : "Player 2 (⭕)";
    this.showGameOver(`🎉 ${winner} wins! 🎉`);

    this.updateDisplay();
  }

  handleDraw() {
    this.gameActive = false;
    this.gamesPlayed++;
    this.showGameOver("🤝 It's a draw! 🤝");
    this.updateDisplay();
  }

  switchPlayer() {
    // Remove active class from current player
    const currentPlayerElement = document.querySelector(
      `.player${this.currentPlayer}`
    );
    currentPlayerElement.classList.remove("active");

    // Switch player
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

    // Add active class to new player
    const newPlayerElement = document.querySelector(
      `.player${this.currentPlayer}`
    );
    newPlayerElement.classList.add("active");
    newPlayerElement.classList.add("player-switch");

    // Remove animation class after animation completes
    setTimeout(() => {
      newPlayerElement.classList.remove("player-switch");
    }, 500);

    this.updateDisplay();
  }

  showGameOver(message) {
    const overlay = document.getElementById("game-overlay");
    const title = document.getElementById("overlay-title");
    const messageElement = document.getElementById("overlay-message");
    const startBtn = document.getElementById("start-btn");

    title.textContent = "Game Over!";
    messageElement.textContent = message;
    startBtn.textContent = "Play Again";

    overlay.classList.remove("hidden");
  }

  startGame() {
    this.board = Array(9).fill("");
    this.currentPlayer = 1;
    this.gameActive = true;

    // Reset player indicators
    document.querySelector(".player1").classList.add("active");
    document.querySelector(".player2").classList.remove("active");

    this.renderBoard();
    this.updateDisplay();
    document.getElementById("game-overlay").classList.add("hidden");
  }

  newGame() {
    this.startGame();
  }

  resetScores() {
    this.playerScores = { 1: 0, 2: 0 };
    this.gamesPlayed = 0;
    this.updateDisplay();
  }

  updateDisplay() {
    // Update scores
    document.getElementById("player1-score").textContent = this.playerScores[1];
    document.getElementById("player2-score").textContent = this.playerScores[2];

    // Update current player
    const playerSymbol = this.currentPlayer === 1 ? "⭕" : "❌";
    document.getElementById(
      "current-player"
    ).textContent = `Player ${this.currentPlayer} (${playerSymbol})`;

    // Update games played
    document.getElementById("games-played").textContent = this.gamesPlayed;

    // Update game status
    const statusElement = document.getElementById("game-status");
    if (this.gameActive) {
      statusElement.textContent = "In Progress";
      statusElement.style.color = "#4caf50";
    } else {
      statusElement.textContent = "Game Over";
      statusElement.style.color = "#ff6b6b";
    }
  }

  setupEventListeners() {
    document.getElementById("back-btn").addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

    document.getElementById("start-btn").addEventListener("click", () => {
      this.startGame();
    });

    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.newGame();
    });

    document
      .getElementById("reset-scores-btn")
      .addEventListener("click", () => {
        this.resetScores();
      });
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new TicTacToe2Player();
});
