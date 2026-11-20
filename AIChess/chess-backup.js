let selectedSquare = null;
let currentTurn = "white";

const squares = document.querySelectorAll(".square");

// White chess pieces
const whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔"];

// Black chess pieces
const blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚"];
squares.forEach(square => {
    const piece = square.textContent.trim();

    if (whitePieces.includes(piece)) {
        square.classList.add("white-piece");
    }

    if (blackPieces.includes(piece)) {
        square.classList.add("black-piece");
    }
});

squares.forEach(square => {

    square.addEventListener("click", function () {

        const piece = this.textContent.trim();

        // STEP 1: Select a piece
        if (selectedSquare === null) {

            if (piece === "") {
                return;
            }

            // Check whether the selected piece belongs to current player
            if (currentTurn === "white" && !whitePieces.includes(piece)) {
                alert("It is White's turn!");
                return;
            }

            if (currentTurn === "black" && !blackPieces.includes(piece)) {
                alert("It is Black's turn!");
                return;
            }

            selectedSquare = this;

            this.style.outline = "4px solid yellow";
        }

        // STEP 2: Move piece
        else {

            if (this === selectedSquare) {
                selectedSquare.style.outline = "none";
                selectedSquare = null;
                return;
            }

            // Move piece
            this.textContent = selectedSquare.textContent;

            selectedSquare.textContent = "";

            selectedSquare.style.outline = "none";

            selectedSquare = null;

            // Change turn
            if (currentTurn === "white") {
                currentTurn = "black";
            } else {
                currentTurn = "white";
            }

            updateTurn();
        }
    });
});


// Display current turn
function updateTurn() {

    const status = document.querySelector(".status p");

    if (currentTurn === "white") {
        status.textContent = "White's Turn";
    } else {
        status.textContent = "Black's Turn";
    }
}
updateTurn();