let selectedSquare = null;
let currentTurn = "white";
let moveHistory = [];
let gameOver = false;
let aiEnabled = true;
let aiDifficulty = "easy";
let draw = false;
let halfmoveClock = 0;

let whiteKingMoved = false;
let blackKingMoved = false;

let whiteRookLeftMoved = false;
let whiteRookRightMoved = false;

let blackRookLeftMoved = false;
let blackRookRightMoved = false;

const squares = document.querySelectorAll(".square");

const whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔"];
const blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚"];

// Get piece color
function getPieceColor(piece) {

    if (whitePieces.includes(piece)) {
        return "white";
    }

    if (blackPieces.includes(piece)) {
        return "black";
    }

    return null;
}

// Get piece type
function getPieceType(piece) {

    const pieces = {
        "♙": "pawn",
        "♟": "pawn",

        "♖": "rook",
        "♜": "rook",

        "♘": "knight",
        "♞": "knight",

        "♗": "bishop",
        "♝": "bishop",

        "♕": "queen",
        "♛": "queen",

        "♔": "king",
        "♚": "king"
    };

    return pieces[piece];
}

// Update piece color
function updatePieceColor(square) {
    const piece = square.textContent.trim();

    square.classList.remove("white-piece", "black-piece");

    if (whitePieces.includes(piece)) {
        square.classList.add("white-piece");
        square.style.setProperty("color", "#ffffff", "important");
    }

    if (blackPieces.includes(piece)) {
        square.classList.add("black-piece");
        square.style.setProperty("color", "#000000", "important");
    }
}

// Check board position
function getPosition(square) {

    const index = Array.from(squares).indexOf(square);

    return {
        row: Math.floor(index / 8),
        col: index % 8
    };
}

// Get square
function getSquare(row, col) {

    if (row < 0 || row >= 8 || col < 0 || col >= 8) {
        return null;
    }

    return squares[row * 8 + col];
}
// Find the King
function findKing(color) {

    const king =
        color === "white" ? "♔" : "♚";

    for (const square of squares) {

        if (square.textContent.trim() === king) {
            return square;
        }
    }

    return null;
}

// Check path
function isPathClear(startRow, startCol, endRow, endCol) {

    const rowStep = Math.sign(endRow - startRow);
    const colStep = Math.sign(endCol - startCol);

    let row = startRow + rowStep;
    let col = startCol + colStep;

    while (row !== endRow || col !== endCol) {

        const square = getSquare(row, col);

        if (!square) {
            return false;
        }

        if (square.textContent.trim() !== "") {
            return false;
        }

        row += rowStep;
        col += colStep;
    }

    return true;
}

// Check valid move
function isValidMove(startSquare, endSquare) {

    const piece = startSquare.textContent.trim();
    const targetPiece = endSquare.textContent.trim();

    const pieceColor = getPieceColor(piece);
    const targetColor = getPieceColor(targetPiece);

    // Cannot capture own piece
    if (targetColor === pieceColor) {
        return false;
    }

    const start = getPosition(startSquare);
    const end = getPosition(endSquare);

    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    const absRow = Math.abs(rowDiff);
    const absCol = Math.abs(colDiff);

    const type = getPieceType(piece);

    // PAWN
    if (type === "pawn") {

        const direction =
            pieceColor === "white" ? -1 : 1;

        const startingRow =
            pieceColor === "white" ? 6 : 1;

        // One step forward
        if (
            colDiff === 0 &&
            rowDiff === direction &&
            targetPiece === ""
        ) {
            return true;
        }

        // Two steps from starting position
        if (
            colDiff === 0 &&
            start.row === startingRow &&
            rowDiff === direction * 2 &&
            targetPiece === ""
        ) {

            const middleSquare =
                getSquare(
                    start.row + direction,
                    start.col
                );

            if (
                middleSquare &&
                middleSquare.textContent.trim() === ""
            ) {
                return true;
            }
        }

        // Capture diagonally
        if (
            absCol === 1 &&
            rowDiff === direction &&
            targetPiece !== "" &&
            targetColor !== pieceColor
        ) {
            return true;
        }

        return false;
    }

    // ROOK
    if (type === "rook") {

        if (
            rowDiff === 0 ||
            colDiff === 0
        ) {

            return isPathClear(
                start.row,
                start.col,
                end.row,
                end.col
            );
        }

        return false;
    }

    // KNIGHT
    if (type === "knight") {

        return (
            (absRow === 2 && absCol === 1) ||
            (absRow === 1 && absCol === 2)
        );
    }

    // BISHOP
    if (type === "bishop") {

        if (absRow === absCol) {

            return isPathClear(
                start.row,
                start.col,
                end.row,
                end.col
            );
        }

        return false;
    }

    // QUEEN
    if (type === "queen") {

        if (
            rowDiff === 0 ||
            colDiff === 0 ||
            absRow === absCol
        ) {

            return isPathClear(
                start.row,
                start.col,
                end.row,
                end.col
            );
        }

        return false;
    }

    // KING
    if (type === "king") {

        return (
            absRow <= 1 &&
            absCol <= 1
        );
    }

    return false;
}
function updateMoveHistory() {

    const historyElement = document.getElementById("moveHistory");

    if (!historyElement) {
        return;
    }

    if (moveHistory.length === 0) {
        historyElement.innerHTML = "No moves yet.";
        return;
    }

    historyElement.innerHTML = moveHistory
        .map((move, index) => {
            return `${index + 1}. ${move}`;
        })
        .join("<br>");
}
// Check if castling is possible
function canCastle(startSquare, endSquare) {

    const piece = startSquare.textContent.trim();

    if (piece !== "♔" && piece !== "♚") {
        return false;
    }

    const color = getPieceColor(piece);

    const start = getPosition(startSquare);
    const end = getPosition(endSquare);

    // King must move exactly two squares
    if (start.row !== end.row ||
        Math.abs(end.col - start.col) !== 2) {
        return false;
    }

    // King must not have moved
    if (color === "white" && whiteKingMoved) {
        return false;
    }

    if (color === "black" && blackKingMoved) {
        return false;
    }

    // King cannot castle while in check
    if (isKingInCheck(color)) {
        return false;
    }

    const direction =
        end.col > start.col ? 1 : -1;

    const rookCol =
        direction === 1 ? 7 : 0;

    const rookSquare =
        getSquare(start.row, rookCol);

    const rook = rookSquare.textContent.trim();

    const expectedRook =
        color === "white" ? "♖" : "♜";

    if (rook !== expectedRook) {
        return false;
    }

    // Check whether the rook has already moved
    if (color === "white") {

        if (direction === 1 && whiteRookRightMoved) {
            return false;
        }

        if (direction === -1 && whiteRookLeftMoved) {
            return false;
        }

    } else {

        if (direction === 1 && blackRookRightMoved) {
            return false;
        }

        if (direction === -1 && blackRookLeftMoved) {
            return false;
        }
    }

    // Squares between King and Rook must be empty
    const step1 = getSquare(
        start.row,
        start.col + direction
    );

    const step2 = getSquare(
        start.row,
        start.col + direction * 2
    );

    if (
        !step1 ||
        !step2 ||
        step1.textContent.trim() !== "" ||
        step2.textContent.trim() !== ""
    ) {
        return false;
    }

    // King cannot pass through an attacked square
    if (isSquareAttacked(step1, direction === 1 ? "black" : "white")) {
        return false;
    }

    if (isSquareAttacked(step2, direction === 1 ? "black" : "white")) {
        return false;
    }

    return true;
}
// Check if a square is attacked
function isSquareAttacked(square, byColor) {

    for (const sourceSquare of squares) {

        const piece = sourceSquare.textContent.trim();

        if (piece === "") {
            continue;
        }

        if (getPieceColor(piece) !== byColor) {
            continue;
        }

        if (isValidMove(sourceSquare, square)) {
            return true;
        }
    }

    return false;
}
// Check if King is in check
function isKingInCheck(color) {

    const kingSquare = findKing(color);

    if (!kingSquare) {
        return false;
    }

    const opponentColor =
        color === "white" ? "black" : "white";

    return isSquareAttacked(
        kingSquare,
        opponentColor
    );
}
// Check if a player has any legal move
function hasLegalMove(color) {

    for (const startSquare of squares) {

        const piece = startSquare.textContent.trim();

        if (piece === "") {
            continue;
        }

        if (getPieceColor(piece) !== color) {
            continue;
        }

        for (const endSquare of squares) {

            if (!isValidMove(startSquare, endSquare)) {
                continue;
            }

            const originalStart =
                startSquare.textContent;

            const originalEnd =
                endSquare.textContent;

            // Try the move
            endSquare.textContent = originalStart;
            startSquare.textContent = "";

            const stillInCheck =
                isKingInCheck(color);

            // Restore the position
            startSquare.textContent = originalStart;
            endSquare.textContent = originalEnd;

            if (!stillInCheck) {
                return true;
            }
        }
    }

    return false;
}
function getLegalMoves(color) {

    const legalMoves = [];

    for (const startSquare of squares) {

        const piece = startSquare.textContent.trim();

        if (piece === "") continue;
        if (getPieceColor(piece) !== color) continue;

        for (const endSquare of squares) {

            if (!isValidMove(startSquare, endSquare)) continue;

            const originalStart = startSquare.textContent;
            const originalEnd = endSquare.textContent;

            endSquare.textContent = originalStart;
            startSquare.textContent = "";

            const stillInCheck = isKingInCheck(color);

            startSquare.textContent = originalStart;
            endSquare.textContent = originalEnd;

            if (!stillInCheck) {
                legalMoves.push({
                    from: startSquare,
                    to: endSquare
                });
            }
        }
    }

    return legalMoves;
}
// Check if King is checkmated
function isCheckmate(color) {

    // King must be in check first
    if (!isKingInCheck(color)) {
        return false;
    }

    // If the player has no legal move, it is checkmate
    if (!hasLegalMove(color)) {
        return true;
    }

    return false;
}
function isStalemate(color) {

    if (isKingInCheck(color)) {
        return false;
    }

    if (hasLegalMove(color)) {
        return false;
    }

    return true;
}
function isInsufficientMaterial() {

    const pieces = [];

    for (const square of squares) {
        const piece = square.textContent.trim();

        if (piece !== "" && piece !== "♔" && piece !== "♚") {
            pieces.push(piece);
        }
    }

    // King vs King
    if (pieces.length === 0) {
        return true;
    }

    // King + one Bishop/Knight vs King
    if (pieces.length === 1) {
        if (
            pieces[0] === "♗" ||
            pieces[0] === "♝" ||
            pieces[0] === "♘" ||
            pieces[0] === "♞"
        ) {
            return true;
        }
    }

    return false;
}
function isFiftyMoveRule() {
    return halfmoveClock >= 100;
}
// Update turn display
function updateTurn() {

    const status =
        document.getElementById("turnStatus");

    if (!status) return;

    if (isCheckmate(currentTurn)) {

        const winner =
            currentTurn === "white"
                ? "Black"
                : "White";

        status.textContent =
            currentTurn.charAt(0).toUpperCase() +
            currentTurn.slice(1) +
            " is in Checkmate! " +
            winner +
            " wins!";

        gameOver = true;
        saveGameResult(
    winner === "White" ? "win" : "loss"
);

    } else if (isStalemate(currentTurn)) {

        status.textContent = "Draw by Stalemate!";
gameOver = true;
saveGameResult("draw");
} else if (isInsufficientMaterial()) {

    status.textContent = "Draw by Insufficient Material!";
    gameOver = true;
    saveGameResult("draw");

} else if (isFiftyMoveRule()) {

    status.textContent = "Draw by 50-Move Rule!";
    gameOver = true;
    saveGameResult("draw");

} else {

    status.textContent =
        currentTurn.charAt(0).toUpperCase() +
        currentTurn.slice(1) +
        "'s Turn";
}
}

// Move piece
function movePiece(startSquare, endSquare) {

    const piece =
        startSquare.textContent.trim();

    endSquare.textContent = piece;
    startSquare.textContent = "";

    updatePieceColor(endSquare);
    updatePieceColor(startSquare);
}
// Pawn Promotion
function promotePawn(square) {

    const piece = square.textContent.trim();
    const position = getPosition(square);

    // White pawn reaches the 8th rank
    if (piece === "♙" && position.row === 0) {

        const choice = prompt(
            "Promote pawn to:\n" +
            "Q = Queen\n" +
            "R = Rook\n" +
            "B = Bishop\n" +
            "N = Knight",
            "Q"
        );

        if (choice === null) {
            square.textContent = "♕";
        } else if (choice.toUpperCase() === "R") {
            square.textContent = "♖";
        } else if (choice.toUpperCase() === "B") {
            square.textContent = "♗";
        } else if (choice.toUpperCase() === "N") {
            square.textContent = "♘";
        } else {
            square.textContent = "♕";
        }

        updatePieceColor(square);
    }

    // Black pawn reaches the 1st rank
    if (piece === "♟" && position.row === 7) {

        const choice = prompt(
            "Promote pawn to:\n" +
            "Q = Queen\n" +
            "R = Rook\n" +
            "B = Bishop\n" +
            "N = Knight",
            "Q"
        );

        if (choice === null) {
            square.textContent = "♛";
        } else if (choice.toUpperCase() === "R") {
            square.textContent = "♜";
        } else if (choice.toUpperCase() === "B") {
            square.textContent = "♝";
        } else if (choice.toUpperCase() === "N") {
            square.textContent = "♞";
        } else {
            square.textContent = "♛";
        }

        updatePieceColor(square);
    }
}

// Click handling
squares.forEach(square => {

    square.addEventListener("click", function () {
        if (gameOver) {
    return;
}

        const piece =
            this.textContent.trim();

        // SELECT PIECE
        if (selectedSquare === null) {

            if (piece === "") {
                return;
            }

            const pieceColor =
                getPieceColor(piece);

            if (pieceColor !== currentTurn) {

                alert(
                    "It is " +
                    currentTurn.charAt(0).toUpperCase() +
                    currentTurn.slice(1) +
                    "'s turn!"
                );

                return;
            }

            selectedSquare = this;

            this.style.outline =
                "4px solid yellow";

            return;
        }

        // CLICK SAME SQUARE
        if (this === selectedSquare) {

            selectedSquare.style.outline = "none";

            selectedSquare = null;

            return;
        }

        // CHECK MOVE
        const castlingMove =
    canCastle(selectedSquare, this);

if (
    isValidMove(
        selectedSquare,
        this
    ) ||
    castlingMove
) {
    const movingPiece = selectedSquare.textContent.trim();
const capturedPiece = this.textContent.trim();

if (
    getPieceType(movingPiece) === "pawn" ||
    capturedPiece !== ""
) {
    halfmoveClock = 0;
} else {
    halfmoveClock++;
}

            movePiece(
                selectedSquare,
                this
            );
            // Move rook during castling
if (castlingMove) {

    const kingPosition =
        getPosition(this);

    const direction =
        getPosition(this).col >
        getPosition(selectedSquare).col
            ? 1
            : -1;

    const rookStart =
        getSquare(
            kingPosition.row,
            direction === 1 ? 7 : 0
        );

    const rookEnd =
        getSquare(
            kingPosition.row,
            kingPosition.col - direction
        );

    movePiece(rookStart, rookEnd);
}
            promotePawn(this);
            const startPosition = getPosition(selectedSquare);
const endPosition = getPosition(this);

const startFile = String.fromCharCode(97 + startPosition.col);
const endFile = String.fromCharCode(97 + endPosition.col);

const startRank = 8 - startPosition.row;
const endRank = 8 - endPosition.row;

const opponentColor =
    currentTurn === "white"
        ? "black"
        : "white";

const checkMark =
    isKingInCheck(opponentColor)
        ? " +"
        : "";

const moveNotation =
    capturedPiece !== ""
        ? startFile + startRank + " x " + endFile + endRank + checkMark
        : startFile + startRank + " → " + endFile + endRank + checkMark;

moveHistory.push(moveNotation);

updateMoveHistory();

            selectedSquare.style.outline =
                "none";

            selectedSquare = null;

            // Change turn
            if (currentTurn === "white") {
                currentTurn = "black";
            } else {
                currentTurn = "white";
            }

            updateTurn();
            if (aiEnabled && currentTurn === "black" && !gameOver) {
    setTimeout(makeAIMove, 500);
}

        } else {

            alert("Invalid move!");

            selectedSquare.style.outline =
                "none";

            selectedSquare = null;
        }

    });

});

// Set colors when page loads
squares.forEach(square => {
    updatePieceColor(square);
});

// Start with White
updateTurn();
const difficultySelect = document.getElementById("difficulty");

if (difficultySelect) {
    difficultySelect.addEventListener("change", function () {
        aiDifficulty = this.value;
    });
}
const pieceValues = {
    "♙": 1,
    "♘": 3,
    "♗": 3,
    "♖": 5,
    "♕": 9,
    "♔": 100,

    "♟": 1,
    "♞": 3,
    "♝": 3,
    "♜": 5,
    "♛": 9,
    "♚": 100
};
function evaluateBoard() {

    let score = 0;

    for (const square of squares) {

        const piece = square.textContent.trim();

        if (piece === "") continue;

        const value = pieceValues[piece] || 0;

        if (blackPieces.includes(piece)) {
            score += value;
        } else if (whitePieces.includes(piece)) {
            score -= value;
        }
    }

    return score;
}
 function evaluateMove(move) {

    const capturedPiece =
        move.to.textContent.trim();

    if (capturedPiece === "") {
        return 0;
    }

    return pieceValues[capturedPiece] || 0;
}
function makeAIMove() {

    if (gameOver) return;

    if (currentTurn !== "black") return;

    const legalMoves = getLegalMoves("black");

    if (legalMoves.length === 0) return;

    let selectedMove;

const captureMoves = legalMoves.filter(move => {
    return move.to.textContent.trim() !== "";
});

if (aiDifficulty === "medium" && captureMoves.length > 0) {

    captureMoves.sort((a, b) => {
        const valueA =
            pieceValues[b.to.textContent.trim()] || 0;

        const valueB =
            pieceValues[a.to.textContent.trim()] || 0;

        return valueA - valueB;
    });

    selectedMove = captureMoves[captureMoves.length - 1];

}
 if (aiDifficulty === "hard" && legalMoves.length > 0) {

    let bestScore = -Infinity;
    let bestMove = legalMoves[0];

    for (const move of legalMoves) {

        const originalFrom = move.from.textContent;
        const originalTo = move.to.textContent;

        // Try the move
        move.to.textContent = originalFrom;
        move.from.textContent = "";

        const score = evaluateBoard();

        // Undo the move
        move.from.textContent = originalFrom;
        move.to.textContent = originalTo;

        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    selectedMove = bestMove;
}

if (captureMoves.length > 0) {

    const randomIndex =
        Math.floor(Math.random() * captureMoves.length);

    selectedMove =
        captureMoves[randomIndex];

} else {

    const randomIndex =
        Math.floor(Math.random() * legalMoves.length);

    selectedMove =
        legalMoves[randomIndex];
}

    const fromPosition =
        getPosition(selectedMove.from);

    const toPosition =
        getPosition(selectedMove.to);

    const movingPiece =
        selectedMove.from.textContent.trim();

    const capturedPiece =
        selectedMove.to.textContent.trim();

    // Update 50-move counter
    if (
        getPieceType(movingPiece) === "pawn" ||
        capturedPiece !== ""
    ) {
        halfmoveClock = 0;
    } else {
        halfmoveClock++;
    }

    // Make the move
    movePiece(
        selectedMove.from,
        selectedMove.to
    );

    // Promote pawn if needed
    promotePawn(selectedMove.to);

    // Add to move history
    moveHistory.push(
        `${fromPosition.row},${fromPosition.col} → ${toPosition.row},${toPosition.col}`
    );

    updateMoveHistory();

    // Change turn back to White
    currentTurn = "white";

    updateTurn();
}
function analyzeGame() {

    const analysis = [];

    analysis.push("=== GAME ANALYSIS ===");

    analysis.push(
        "Total Moves: " + moveHistory.length
    );

    let captures = 0;

    for (const move of moveHistory) {
        if (move.includes("x")) {
            captures++;
        }
    }

    let checks = 0;

    for (const move of moveHistory) {
        if (move.includes("+")) {
            checks++;
        }
    }

    analysis.push(
        "Checks: " + checks
    );

    analysis.push(
        "Captures: " + captures
    );

    if (isCheckmate(currentTurn)) {

        const winner =
            currentTurn === "white"
                ? "Black"
                : "White";

        analysis.push(
            "Game Status: Checkmate"
        );

        analysis.push(
            "Winner: " + winner
        );

    } else if (isStalemate(currentTurn)) {

        analysis.push(
            "Game Status: Draw by Stalemate"
        );

        analysis.push(
            "Winner: None"
        );

    } else if (isInsufficientMaterial()) {

        analysis.push(
            "Game Status: Draw by Insufficient Material"
        );

        analysis.push(
            "Winner: None"
        );

    } else if (isFiftyMoveRule()) {

        analysis.push(
            "Game Status: Draw by 50-Move Rule"
        );

        analysis.push(
            "Winner: None"
        );

    } else {

        analysis.push(
            "Game Status: Game in Progress"
        );
    }

    alert(analysis.join("\n"));
}
function saveGameResult(result) {

    fetch("game-result", {
        method: "POST",

        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },

        body: "result=" + encodeURIComponent(result)
    })

    .then(response => response.text())

    .then(data => {
        console.log("Game result saved:", data);
    })

    .catch(error => {
        console.error("Error saving game result:", error);
    });
}
console.log("SAVE GAME RESULT FUNCTION LOADED");
