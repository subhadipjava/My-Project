
// Get HTML Elements
const passwordField = document.getElementById("password");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const toggleBtn = document.getElementById("toggleBtn");

const lengthSlider = document.getElementById("length");
const lengthValue = document.getElementById("lengthValue");

const uppercase = document.getElementById("uppercase");
const lowercase = document.getElementById("lowercase");
const numbers = document.getElementById("numbers");
const symbols = document.getElementById("symbols");

const strengthText = document.getElementById("strengthText");
const strengthFill = document.getElementById("strengthFill");
const notification = document.getElementById("notification");


// Secure Random Number Function
function randomIndex(max) {
    const limit = Math.floor(256 / max) * max;
    let value;

    do {
        value = crypto.getRandomValues(
            new Uint8Array(1)
        )[0];
    } while (value >= limit);

    return value % max;
}


// Update Password Length
lengthSlider.addEventListener("input", function () {
    lengthValue.textContent = lengthSlider.value;
});


// Show Notification
function showNotification(message) {
    notification.textContent = message;

    setTimeout(() => {
        notification.textContent = "";
    }, 2000);
}


// Generate Password
function generatePassword() {

    const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "!@#$%^&*()_+-=[]{}?";

    let characters = "";
    let password = "";
    let requiredCharacters = [];

    if (uppercase.checked) {
        characters += upperChars;
        requiredCharacters.push(upperChars);
    }

    if (lowercase.checked) {
        characters += lowerChars;
        requiredCharacters.push(lowerChars);
    }

    if (numbers.checked) {
        characters += numberChars;
        requiredCharacters.push(numberChars);
    }

    if (symbols.checked) {
        characters += symbolChars;
        requiredCharacters.push(symbolChars);
    }

    if (characters === "") {
        alert("Please select at least one option!");
        return;
    }

    const length = Number(lengthSlider.value);

    // Add at least one character from each selected category
    requiredCharacters.forEach(group => {
        password += group[randomIndex(group.length)];
    });

    // Generate remaining characters
    while (password.length < length) {
        password += characters[randomIndex(characters.length)];
    }

    // Shuffle password
    const passwordArray = password.split("");

    for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = randomIndex(i + 1);

        [passwordArray[i], passwordArray[j]] =
        [passwordArray[j], passwordArray[i]];
    }

    password = passwordArray.join("");

    // Display Password
    passwordField.value = password;

    // Reset visibility
    passwordField.type = "password";
    toggleBtn.textContent = "Show";

    // Check Strength
    checkStrength(password, requiredCharacters.length);

    showNotification("Password generated successfully!");
}


// Password Strength Checker
function checkStrength(password, selectedOptions) {

    let score = 0;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (selectedOptions >= 3) score++;
    if (selectedOptions === 4) score++;

    if (score <= 1) {

        strengthText.textContent = "Weak";
        strengthText.style.color = "#ff5555";

        strengthFill.style.width = "25%";
        strengthFill.style.background = "#ff5555";

    } else if (score <= 2) {

        strengthText.textContent = "Medium";
        strengthText.style.color = "#f5c542";

        strengthFill.style.width = "60%";
        strengthFill.style.background = "#f5c542";

    } else {

        strengthText.textContent = "Strong";
        strengthText.style.color = "#4ade80";

        strengthFill.style.width = "100%";
        strengthFill.style.background = "#4ade80";
    }
}


// Show / Hide Password
toggleBtn.addEventListener("click", function () {

    if (passwordField.value === "") {
        showNotification("Generate a password first!");
        return;
    }

    if (passwordField.type === "password") {

        passwordField.type = "text";
        toggleBtn.textContent = "Hide";

    } else {

        passwordField.type = "password";
        toggleBtn.textContent = "Show";
    }
});


// Copy Password
copyBtn.addEventListener("click", async function () {

    if (passwordField.value === "") {
        showNotification("Generate a password first!");
        return;
    }

    try {

        await navigator.clipboard.writeText(
            passwordField.value
        );

        showNotification("Password copied successfully!");

    } catch (error) {

        showNotification("Unable to copy password.");
    }
});


// Generate Button
generateBtn.addEventListener("click", generatePassword);
