class Dashboard {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.checkAuth();
    this.setupEventListeners();
    this.loadUserInfo();
  }

  checkAuth() {
    const loggedInUser = localStorage.getItem("currentUser");
    if (!loggedInUser) {
      window.location.href = "login.html";
      return;
    }

    this.currentUser = JSON.parse(loggedInUser);
  }

  setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn.addEventListener("click", () => {
      this.logout();
    });

    // Game cards
    const gameCards = document.querySelectorAll(".game-card");
    gameCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.classList.contains("play-btn")) {
          const gameType = card.dataset.game;
          this.launchGame(gameType);
        }
      });
    });
  }

  loadUserInfo() {
    if (this.currentUser) {
      document.getElementById(
        "username"
      ).textContent = `Welcome, ${this.currentUser.username}!`;
    }
  }

  logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }

  launchGame(gameType) {
    switch (gameType) {
      case "chess":
        window.open("chess.html", "_blank");
        break;
      case "number-guessing":
        window.open("number-guessing.html", "_blank");
        break;
      case "typing-game":
        window.open("typing-game.html", "_blank");
        break;
      case "memory-card-2player":
        window.open("memory-card-2player.html", "_blank");
        break;
      case "tictactoe-2player":
        window.open("tictactoe-2player.html", "_blank");
        break;
      case "space-invaders":
        window.open("index.html", "_blank");
        break;
      case "snake-classic":
        window.location.href = "snake-classic.html";
        break;
      case "car-racing":
        window.open("car-racing.html", "_blank");
        break;
      default:
        console.log("Game not implemented yet");
    }
  }
}

// Initialize dashboard
new Dashboard();
