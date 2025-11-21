class MemoryCard2Player {
  constructor() {
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.currentPlayer = 1;
    this.playerScores = { 1: 0, 2: 0 };
    this.moves = 0;
    this.gameStarted = false;
    this.timer = null;
    this.startTime = null;

    this.symbols = ["🎮", "🎲", "🎯", "🎪", "🎨", "🎭", "🎪", "🎨"];
    this.initializeGame();
    this.setupEventListeners();
  }

  initializeGame() {
    this.createCards();
    this.shuffleCards();
    this.renderBoard();
    this.updateDisplay();
  }

  createCards() {
    this.cards = [];
    this.symbols.forEach((symbol, index) => {
      // Create two cards for each symbol
      this.cards.push({
        id: index * 2,
        symbol: symbol,
        isFlipped: false,
        isMatched: false,
      });
      this.cards.push({
        id: index * 2 + 1,
        symbol: symbol,
        isFlipped: false,
        isMatched: false,
      });
    });
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  renderBoard() {
    const gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = "";

    this.cards.forEach((card, index) => {
      const cardElement = document.createElement("div");
      cardElement.className = "card";
      cardElement.dataset.index = index;

      if (card.isMatched) {
        cardElement.classList.add("matched");
      } else if (card.isFlipped) {
        cardElement.classList.add("flipped");
      }

      cardElement.innerHTML = `
                <div class="card-front">?</div>
                <div class="card-back">${card.symbol}</div>
            `;

      cardElement.addEventListener("click", () => this.handleCardClick(index));
      gameBoard.appendChild(cardElement);
    });
  }

  handleCardClick(index) {
    if (!this.gameStarted) return;

    const card = this.cards[index];

    // Don't allow clicking on already flipped or matched cards
    if (card.isFlipped || card.isMatched) return;

    // Don't allow clicking on more than 2 cards at once
    if (this.flippedCards.length >= 2) return;

    // Flip the card
    this.flipCard(index);

    // Add to flipped cards
    this.flippedCards.push(index);

    // Check if we have 2 cards flipped
    if (this.flippedCards.length === 2) {
      this.moves++;
      this.checkMatch();
    }

    this.updateDisplay();
  }

  flipCard(index) {
    this.cards[index].isFlipped = true;
    const cardElement = document.querySelector(`[data-index="${index}"]`);
    cardElement.classList.add("flipped");
  }

  checkMatch() {
    const [index1, index2] = this.flippedCards;
    const card1 = this.cards[index1];
    const card2 = this.cards[index2];

    if (card1.symbol === card2.symbol) {
      // Match found!
      card1.isMatched = true;
      card2.isMatched = true;
      this.matchedPairs++;

      // Award point to current player
      this.playerScores[this.currentPlayer]++;

      // Mark cards as matched
      const cardElements = document.querySelectorAll(
        `[data-index="${index1}"], [data-index="${index2}"]`
      );
      cardElements.forEach((element) => {
        element.classList.add("matched");
      });

      // Check if game is over
      if (this.matchedPairs === this.symbols.length) {
        this.endGame();
      }
    } else {
      // No match, flip cards back after delay
      setTimeout(() => {
        this.flipCardsBack();
        this.switchPlayer();
      }, 1000);
    }

    // Clear flipped cards array
    this.flippedCards = [];
  }

  flipCardsBack() {
    this.flippedCards.forEach((index) => {
      this.cards[index].isFlipped = false;
      const cardElement = document.querySelector(`[data-index="${index}"]`);
      cardElement.classList.remove("flipped");
    });
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
  }

  startGame() {
    this.gameStarted = true;
    this.startTime = Date.now();
    this.startTimer();
    document.getElementById("game-overlay").classList.add("hidden");
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.startTime) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        document.getElementById("timer").textContent = `${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    }, 1000);
  }

  endGame() {
    clearInterval(this.timer);
    this.gameStarted = false;

    // Determine winner
    let winner;
    if (this.playerScores[1] > this.playerScores[2]) {
      winner = "Player 1";
    } else if (this.playerScores[2] > this.playerScores[1]) {
      winner = "Player 2";
    } else {
      winner = "Tie";
    }

    // Show game over overlay
    const overlay = document.getElementById("game-overlay");
    const title = document.getElementById("overlay-title");
    const message = document.getElementById("overlay-message");
    const startBtn = document.getElementById("start-btn");

    title.textContent = "Game Over!";
    if (winner === "Tie") {
      message.textContent = `It's a tie! Both players scored ${this.playerScores[1]} points.`;
    } else {
      message.textContent = `${winner} wins with ${Math.max(
        this.playerScores[1],
        this.playerScores[2]
      )} points!`;
    }
    startBtn.textContent = "Play Again";

    overlay.classList.remove("hidden");
  }

  newGame() {
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.moves = 0;
    this.currentPlayer = 1;
    this.gameStarted = false;

    // Reset timer
    clearInterval(this.timer);
    document.getElementById("timer").textContent = "00:00";

    // Reset player indicators
    document.querySelector(".player1").classList.add("active");
    document.querySelector(".player2").classList.remove("active");

    this.initializeGame();
    this.startGame();
  }

  resetScores() {
    this.playerScores = { 1: 0, 2: 0 };
    this.updateDisplay();
  }

  updateDisplay() {
    // Update scores
    document.getElementById("player1-score").textContent = this.playerScores[1];
    document.getElementById("player2-score").textContent = this.playerScores[2];

    // Update current player
    document.getElementById(
      "current-player"
    ).textContent = `Player ${this.currentPlayer}`;

    // Update moves
    document.getElementById("moves").textContent = this.moves;
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

    document.getElementById("reset-btn").addEventListener("click", () => {
      this.resetScores();
    });
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new MemoryCard2Player();
});
