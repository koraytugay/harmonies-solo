// Token Game Logic

const INITIAL_TOKENS = {
    blue: 23,
    gray: 23,
    brown: 21,
    green: 19,
    yellow: 19,
    red: 15
};

let gameState = {
    remainingTokens: {},
    currentTokens: []
};

// Initialize the game
function initGame() {
    gameState.remainingTokens = { ...INITIAL_TOKENS };
    gameState.currentTokens = [];
    drawNewTokens();
    updateDisplay();
}

// Draw 3 groups of 3 tokens each
function drawNewTokens() {
    const newTokens = [];

    // Create a pool of available tokens
    const tokenPool = [];
    for (const [color, count] of Object.entries(gameState.remainingTokens)) {
        for (let i = 0; i < count; i++) {
            tokenPool.push(color);
        }
    }

    // Check if we have enough tokens
    if (tokenPool.length < 9) {
        alert('Not enough tokens remaining!');
        return false;
    }

    // Draw 9 random tokens
    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * tokenPool.length);
        const selectedColor = tokenPool[randomIndex];
        newTokens.push(selectedColor);
        tokenPool.splice(randomIndex, 1);
        gameState.remainingTokens[selectedColor]--;
    }

    // Group tokens into 3 groups of 3
    gameState.currentTokens = [
        newTokens.slice(0, 3),
        newTokens.slice(3, 6),
        newTokens.slice(6, 9)
    ];

    return true;
}

// Update the display
function updateDisplay() {
    updateTokenCounter();
    updateTokenGroups();
    updateDiscardButton();
}

// Update the token counter
function updateTokenCounter() {
    const countsContainer = document.getElementById('tokenCounts');
    countsContainer.innerHTML = '';

    const tokenNames = {
        gray: 'Mountains',
        red: 'Buildings',
        brown: 'Trunks',
        green: 'Leaves',
        blue: 'Water',
        yellow: 'Fields'
    };

    for (const [color, count] of Object.entries(gameState.remainingTokens)) {
        const countDiv = document.createElement('div');
        countDiv.className = 'token-count';

        const colorBox = document.createElement('div');
        colorBox.className = `token-count-color ${color}`;
        colorBox.style.backgroundColor = getColorRGB(color);

        const countText = document.createElement('span');
        countText.textContent = `${tokenNames[color]}: ${count}`;

        countDiv.appendChild(colorBox);
        countDiv.appendChild(countText);
        countsContainer.appendChild(countDiv);
    }
}

// Update the token groups display
function updateTokenGroups() {
    const groupsContainer = document.getElementById('tokenGroups');
    groupsContainer.innerHTML = '';

    gameState.currentTokens.forEach((group, groupIndex) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'token-group';

        group.forEach((color, tokenIndex) => {
            const tokenDiv = document.createElement('div');
            tokenDiv.className = `token ${color}`;
            const randomRotation = Math.floor(Math.random() * 360);
            tokenDiv.style.transform = `rotate(${randomRotation}deg)`;
            groupDiv.appendChild(tokenDiv);
        });

        groupsContainer.appendChild(groupDiv);
    });
}

// Update discard button state
function updateDiscardButton() {
    const totalRemaining = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
    const discardBtn = document.getElementById('discardBtn');
    discardBtn.disabled = totalRemaining < 9;
}

// Get RGB color string
function getColorRGB(color) {
    const colors = {
        blue: 'rgb(17, 127, 138)',
        gray: 'rgb(131, 132, 133)',
        brown: 'rgb(134, 83, 64)',
        green: 'rgb(146, 152, 62)',
        yellow: 'rgb(211, 165, 42)',
        red: 'rgb(186, 59, 80)'
    };
    return colors[color];
}

// Event Listeners
document.getElementById('discardBtn').addEventListener('click', () => {
    if (drawNewTokens()) {
        updateDisplay();
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to restart the game?')) {
        initGame();
    }
});

// Start the game when page loads
initGame();
