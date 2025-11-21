class ChessGame {
  constructor() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedPiece = null;
    this.validMoves = [];
    this.moveHistory = [];
    this.gameStatus = "in_progress";
    this.isCheck = false;
    this.isCheckmate = false;

    this.initializeGame();
    this.setupEventListeners();
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && this.selectedPiece) {
        this.showPossibleMoves();
      }
    });
    this.capturedWhite = [];
    this.capturedBlack = [];
  }

  initializeBoard() {
    const board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));

    // Set up pawns
    for (let i = 0; i < 8; i++) {
      board[1][i] = { type: "pawn", color: "black", hasMoved: false };
      board[6][i] = { type: "pawn", color: "white", hasMoved: false };
    }

    // Set up other pieces
    const pieces = [
      "rook",
      "knight",
      "bishop",
      "queen",
      "king",
      "bishop",
      "knight",
      "rook",
    ];
    for (let i = 0; i < 8; i++) {
      board[0][i] = { type: pieces[i], color: "black", hasMoved: false };
      board[7][i] = { type: pieces[i], color: "white", hasMoved: false };
    }

    return board;
  }

  initializeGame() {
    this.renderBoard();
    this.updateGameInfo();
  }

  setupEventListeners() {
    document.getElementById("back-btn").addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });

    document.getElementById("new-game-btn").addEventListener("click", () => {
      this.newGame();
    });

    document.getElementById("undo-btn").addEventListener("click", () => {
      this.undoMove();
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
      this.resetGame();
    });
  }

  renderBoard() {
    const boardElement = document.getElementById("chess-board");
    boardElement.innerHTML = "";

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = document.createElement("div");
        square.className = `chess-square ${
          (row + col) % 2 === 0 ? "white" : "black"
        }`;
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = this.board[row][col];
        if (piece) {
          const pieceElement = document.createElement("div");
          pieceElement.className = `chess-piece ${piece.color}`;
          pieceElement.textContent = this.getPieceSymbol(piece);
          square.appendChild(pieceElement);
        }

        square.addEventListener("click", () =>
          this.handleSquareClick(row, col)
        );
        boardElement.appendChild(square);
      }
    }
  }

  getPieceSymbol(piece) {
    const symbols = {
      king: "♔",
      queen: "♕",
      rook: "♖",
      bishop: "♗",
      knight: "♘",
      pawn: "♙",
    };
    return piece.color === "black" ? symbols[piece.type] : symbols[piece.type];
  }

  handleSquareClick(row, col) {
    const piece = this.board[row][col];

    // If no piece is selected and clicked square has a piece of current player's color
    if (!this.selectedPiece && piece && piece.color === this.currentPlayer) {
      this.selectPiece(row, col);
    }
    // If a piece is selected and clicked square is a valid move
    else if (
      this.selectedPiece &&
      this.isValidMove(this.selectedPiece.row, this.selectedPiece.col, row, col)
    ) {
      this.makeMove(this.selectedPiece.row, this.selectedPiece.col, row, col);
    }
    // If a piece is selected and clicked square has a piece of current player's color, select new piece
    else if (
      this.selectedPiece &&
      piece &&
      piece.color === this.currentPlayer
    ) {
      this.selectPiece(row, col);
    }
    // Deselect current piece
    else {
      this.deselectPiece();
    }
  }

  selectPiece(row, col) {
    this.deselectPiece();
    this.selectedPiece = { row, col };
    this.validMoves = this.getValidMoves(row, col);
    this.highlightSquares();
  }

  deselectPiece() {
    this.selectedPiece = null;
    this.validMoves = [];
    this.clearHighlights();
  }

  highlightSquares() {
    // Highlight selected piece
    const selectedSquare = document.querySelector(
      `[data-row="${this.selectedPiece.row}"][data-col="${this.selectedPiece.col}"]`
    );
    if (selectedSquare) {
      selectedSquare.classList.add("selected");
    }

    // Highlight valid moves
    this.validMoves.forEach((move) => {
      const square = document.querySelector(
        `[data-row="${move.row}"][data-col="${move.col}"]`
      );
      if (square) {
        if (this.board[move.row][move.col]) {
          square.classList.add("capture");
        } else {
          square.classList.add("valid-move");
        }
      }
    });
  }

  clearHighlights() {
    document.querySelectorAll(".chess-square").forEach((square) => {
      square.classList.remove("selected", "valid-move", "capture");
    });
  }

  getValidMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece) return [];

    const moves = [];
    const directions = this.getPieceDirections(piece.type);

    if (piece.type === "pawn") {
      moves.push(...this.getPawnMoves(row, col));
    } else if (piece.type === "knight") {
      moves.push(...this.getKnightMoves(row, col));
    } else {
      // For pieces that move in straight lines (rook, bishop, queen, king)
      directions.forEach((direction) => {
        moves.push(
          ...this.getLinearMoves(
            row,
            col,
            direction,
            piece.type === "king" ? 1 : 8
          )
        );
      });
    }

    // Filter out moves that would put own king in check
    return moves.filter(
      (move) => !this.wouldBeInCheck(row, col, move.row, move.col)
    );
  }

  getPawnMoves(row, col) {
    const moves = [];
    const piece = this.board[row][col];
    const direction = piece.color === "white" ? -1 : 1;
    const startRow = piece.color === "white" ? 6 : 1;

    // Forward move
    if (
      this.isValidPosition(row + direction, col) &&
      !this.board[row + direction][col]
    ) {
      moves.push({ row: row + direction, col: col });

      // Double move from starting position
      if (row === startRow && !this.board[row + 2 * direction][col]) {
        moves.push({ row: row + 2 * direction, col: col });
      }
    }

    // Diagonal captures
    const captureCols = [col - 1, col + 1];
    captureCols.forEach((captureCol) => {
      if (this.isValidPosition(row + direction, captureCol)) {
        const targetPiece = this.board[row + direction][captureCol];
        if (targetPiece && targetPiece.color !== piece.color) {
          moves.push({ row: row + direction, col: captureCol });
        }
      }
    });

    return moves;
  }

  getKnightMoves(row, col) {
    const moves = [];
    const knightMoves = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    knightMoves.forEach(([dRow, dCol]) => {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.board[newRow][newCol];
        if (!targetPiece || targetPiece.color !== this.board[row][col].color) {
          moves.push({ row: newRow, col: newCol });
        }
      }
    });

    return moves;
  }

  getLinearMoves(row, col, direction, maxDistance) {
    const moves = [];
    const piece = this.board[row][col];

    for (let i = 1; i <= maxDistance; i++) {
      const newRow = row + direction.row * i;
      const newCol = col + direction.col * i;

      if (!this.isValidPosition(newRow, newCol)) break;

      const targetPiece = this.board[newRow][newCol];
      if (!targetPiece) {
        moves.push({ row: newRow, col: newCol });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row: newRow, col: newCol });
        }
        break;
      }
    }

    return moves;
  }

  getPieceDirections(pieceType) {
    const directions = {
      rook: [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
      ],
      bishop: [
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 },
      ],
      queen: [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 },
      ],
      king: [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 },
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 },
      ],
    };
    return directions[pieceType] || [];
  }

  isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  isValidMove(fromRow, fromCol, toRow, toCol) {
    return this.validMoves.some(
      (move) => move.row === toRow && move.col === toCol
    );
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    // Record move
    const move = {
      piece: piece.type,
      from: `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`,
      to: `${String.fromCharCode(97 + toCol)}${8 - toRow}`,
      captured: capturedPiece ? capturedPiece.type : null,
      player: this.currentPlayer,
    };

    // Make the move
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;
    piece.hasMoved = true;

    // Check for pawn promotion
    if (piece.type === "pawn" && (toRow === 0 || toRow === 7)) {
      this.board[toRow][toCol] = {
        type: "queen",
        color: piece.color,
        hasMoved: true,
      };
    }

    // Update game state
    this.moveHistory.push(move);
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";

    // Check for check/checkmate
    this.checkGameState();

    // Update display
    this.deselectPiece();
    this.renderBoard();
    this.updateGameInfo();
    this.updateMoveHistory();
    if (capturedPiece) {
      if (capturedPiece.color === "white")
        this.capturedWhite.push(capturedPiece);
      else this.capturedBlack.push(capturedPiece);
      this.updateCapturedPieces();
    }
  }

  wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
    // Temporarily make the move
    const tempPiece = this.board[fromRow][fromCol];
    const capturedPiece = this.board[toRow][toCol];

    this.board[toRow][toCol] = tempPiece;
    this.board[fromRow][fromCol] = null;

    // Check if king is in check
    const inCheck = this.isKingInCheck(this.currentPlayer);

    // Restore the board
    this.board[fromRow][fromCol] = tempPiece;
    this.board[toRow][toCol] = capturedPiece;

    return inCheck;
  }

  isKingInCheck(color) {
    // Find king position
    let kingRow, kingCol;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.type === "king" && piece.color === color) {
          kingRow = row;
          kingCol = col;
          break;
        }
      }
    }

    // Check if any opponent piece can attack the king
    const opponentColor = color === "white" ? "black" : "white";
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === opponentColor) {
          const moves = this.getValidMoves(row, col);
          if (
            moves.some((move) => move.row === kingRow && move.col === kingCol)
          ) {
            return true;
          }
        }
      }
    }

    return false;
  }

  checkGameState() {
    this.isCheck = this.isKingInCheck(this.currentPlayer);

    if (this.isCheck) {
      // Check for checkmate
      const canEscape = this.canEscapeCheck();
      if (!canEscape) {
        this.isCheckmate = true;
        this.gameStatus = "checkmate";
      } else {
        this.gameStatus = "check";
      }
    } else {
      this.gameStatus = "in_progress";
    }
  }

  canEscapeCheck() {
    // Check if any move can get the king out of check
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentPlayer) {
          const moves = this.getValidMoves(row, col);
          if (moves.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  updateGameInfo() {
    const currentPlayerElement = document.getElementById("current-player");
    const gameStatusElement = document.getElementById("game-status");

    currentPlayerElement.textContent = `${
      this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)
    }'s Turn`;

    if (this.gameStatus === "checkmate") {
      const winner = this.currentPlayer === "white" ? "Black" : "White";
      gameStatusElement.textContent = `Checkmate! ${winner} wins!`;
      gameStatusElement.style.color = "#ff6b6b";
    } else if (this.gameStatus === "check") {
      gameStatusElement.textContent = "Check!";
      gameStatusElement.style.color = "#ffeb3b";
    } else {
      gameStatusElement.textContent = "Game in Progress";
      gameStatusElement.style.color = "#4caf50";
    }
  }

  updateMoveHistory() {
    const movesList = document.getElementById("moves-list");
    movesList.innerHTML = "";

    this.moveHistory.forEach((move, index) => {
      const moveItem = document.createElement("div");
      moveItem.className = `move-item ${move.player}`;
      moveItem.textContent = `${Math.floor(index / 2) + 1}. ${move.from}-${
        move.to
      }`;
      if (move.captured) {
        moveItem.textContent += ` (${move.captured})`;
      }
      movesList.appendChild(moveItem);
    });
  }

  newGame() {
    this.board = this.initializeBoard();
    this.currentPlayer = "white";
    this.selectedPiece = null;
    this.validMoves = [];
    this.moveHistory = [];
    this.gameStatus = "in_progress";
    this.isCheck = false;
    this.isCheckmate = false;
    this.capturedWhite = [];
    this.capturedBlack = [];

    this.renderBoard();
    this.updateGameInfo();
    this.updateMoveHistory();
    this.updateCapturedPieces();
    document.getElementById("possible-moves").textContent = "";
  }

  undoMove() {
    if (this.moveHistory.length === 0) return;

    // For simplicity, just start a new game
    // In a full implementation, you'd store the board state for each move
    this.newGame();
  }

  resetGame() {
    this.newGame();
  }

  showPossibleMoves() {
    const movesArea = document.getElementById("possible-moves");
    if (!this.selectedPiece || !this.validMoves.length) {
      movesArea.textContent = "";
      return;
    }
    const from = `${String.fromCharCode(97 + this.selectedPiece.col)}${
      8 - this.selectedPiece.row
    }`;
    const moves = this.validMoves.map((move) => {
      const to = `${String.fromCharCode(97 + move.col)}${8 - move.row}`;
      const captured = this.board[move.row][move.col];
      return captured
        ? `${from} → ${to} (captures ${captured.type})`
        : `${from} → ${to}`;
    });
    movesArea.textContent = "Moves: " + moves.join(", ");
  }

  updateCapturedPieces() {
    const capturedList = document.getElementById("captured-list");
    capturedList.innerHTML = "";
    const all = this.capturedWhite.concat(this.capturedBlack);
    all.forEach((piece) => {
      const div = document.createElement("span");
      div.textContent = this.getPieceSymbol({
        type: piece.type,
        color: piece.color,
      });
      div.className = "chess-piece " + piece.color;
      capturedList.appendChild(div);
    });
  }
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new ChessGame();
});
