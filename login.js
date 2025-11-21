class LoginSystem {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("users")) || [];
    this.currentUser = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.checkLoginStatus();
  }

  setupEventListeners() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Register link
    const registerLink = document.getElementById("registerLink");
    registerLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.showRegisterModal();
    });

    // Register form
    const registerForm = document.getElementById("registerForm");
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleRegister();
    });

    // Modal close
    const modal = document.getElementById("registerModal");
    const closeBtn = document.querySelector(".close");
    closeBtn.addEventListener("click", () => {
      this.hideRegisterModal();
    });

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.hideRegisterModal();
      }
    });
  }

  checkLoginStatus() {
    const loggedInUser = localStorage.getItem("currentUser");
    if (loggedInUser) {
      this.currentUser = JSON.parse(loggedInUser);
      this.redirectToDashboard();
    }
  }

  handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = this.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      this.showMessage("Login successful!", "success");
      setTimeout(() => {
        this.redirectToDashboard();
      }, 1000);
    } else {
      this.showMessage("Invalid username or password!", "error");
    }
  }

  handleRegister() {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validation
    if (password !== confirmPassword) {
      this.showMessage("Passwords do not match!", "error");
      return;
    }

    if (this.users.find((u) => u.username === username)) {
      this.showMessage("Username already exists!", "error");
      return;
    }

    if (this.users.find((u) => u.email === email)) {
      this.showMessage("Email already registered!", "error");
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      username,
      email,
      password,
      score: 0,
      gamesPlayed: 0,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    localStorage.setItem("users", JSON.stringify(this.users));

    this.showMessage("Account created successfully!", "success");
    this.hideRegisterModal();

    // Clear register form
    document.getElementById("registerForm").reset();
  }

  showRegisterModal() {
    document.getElementById("registerModal").style.display = "block";
  }

  hideRegisterModal() {
    document.getElementById("registerModal").style.display = "none";
  }

  showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: #000;
            font-weight: 700;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${
              type === "success"
                ? "linear-gradient(45deg, #00ff88, #00ffff)"
                : "linear-gradient(45deg, #ff4444, #ff8844)"
            };
            box-shadow: 0 5px 15px rgba(0, 255, 136, 0.4);
        `;

    document.body.appendChild(messageDiv);

    // Remove message after 3 seconds
    setTimeout(() => {
      messageDiv.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(messageDiv);
      }, 300);
    }, 3000);
  }

  redirectToDashboard() {
    window.location.href = "dashboard.html";
  }
}

// Add CSS animations for messages
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize login system
new LoginSystem();
