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
    currentTokens: [],
    pileTokenElements: [] // Store references to pile token DOM elements
};

// Initialize the game
function initGame() {
    gameState.remainingTokens = { ...INITIAL_TOKENS };
    gameState.currentTokens = [];
    gameState.pileTokenElements = [];
    updateTokenCounter();
    updateTokenGroups();
    updateDiscardButton();
    // Don't draw tokens on init, wait for first user action or draw immediately
    setTimeout(() => drawNewTokensWithAnimation(), 100);
}

// Discard current tokens with falling animation
async function discardCurrentTokens() {
    const groupsContainer = document.getElementById('tokenGroups');
    const allTokens = groupsContainer.querySelectorAll('.token');

    // Animate all tokens falling off screen
    const fallPromises = [];
    allTokens.forEach((token, index) => {
        const promise = new Promise(resolve => {
            const rect = token.getBoundingClientRect();

            // Create a clone for animation
            const animToken = token.cloneNode(true);
            animToken.style.position = 'fixed';
            animToken.style.left = `${rect.left}px`;
            animToken.style.top = `${rect.top}px`;
            animToken.style.zIndex = '999';
            animToken.style.transition = 'all 0.8s ease-in';
            document.body.appendChild(animToken);

            // Remove original
            token.style.opacity = '0';

            // Start falling animation
            setTimeout(() => {
                animToken.style.top = `${window.innerHeight + 100}px`;
                animToken.style.transform = `${animToken.style.transform} rotate(${Math.random() * 360}deg)`;
            }, index * 50); // Stagger the start times

            // Clean up after animation
            setTimeout(() => {
                animToken.remove();
                resolve();
            }, 800 + (index * 50));
        });
        fallPromises.push(promise);
    });

    await Promise.all(fallPromises);
    groupsContainer.innerHTML = '';
}

// Draw tokens with animation
async function drawNewTokensWithAnimation() {
    // Check if we have enough tokens
    if (gameState.pileTokenElements.length < 9) {
        alert('Not enough tokens remaining!');
        return false;
    }

    // Discard current tokens if any exist
    const groupsContainer = document.getElementById('tokenGroups');
    if (groupsContainer.children.length > 0) {
        await discardCurrentTokens();
    }

    // Select 9 random token elements from the pile
    const selectedTokenElements = [];
    const newTokens = [];

    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * gameState.pileTokenElements.length);
        const tokenElement = gameState.pileTokenElements[randomIndex];
        const color = tokenElement.dataset.color;

        selectedTokenElements.push(tokenElement);
        newTokens.push(color);
        gameState.pileTokenElements.splice(randomIndex, 1);
        gameState.remainingTokens[color]--;
    }

    // Group tokens into 3 groups of 3
    gameState.currentTokens = [
        newTokens.slice(0, 3),
        newTokens.slice(3, 6),
        newTokens.slice(6, 9)
    ];

    // Create the group divs
    const groupDivs = [];
    for (let i = 0; i < 3; i++) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'token-group';
        groupsContainer.appendChild(groupDiv);
        groupDivs.push(groupDiv);
    }

    // Animate tokens one by one
    for (let i = 0; i < selectedTokenElements.length; i++) {
        const groupIndex = Math.floor(i / 3);
        const tokenIndexInGroup = i % 3;
        await animateTokenToGroup(selectedTokenElements[i], groupDivs[groupIndex], newTokens[i], tokenIndexInGroup);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    updateDiscardButton();
    return true;
}

// Animate a single token from pile to group
function animateTokenToGroup(tokenElement, groupDiv, color, tokenIndexInGroup) {
    return new Promise(resolve => {
        const pileRect = tokenElement.getBoundingClientRect();
        const groupRect = groupDiv.getBoundingClientRect();

        // Get the original rotation from the pile token
        const originalRotation = tokenElement.style.transform;

        // Calculate target position to match CSS positioning exactly
        let targetX, targetY;
        if (tokenIndexInGroup === 0) {
            // CSS: top: 20px, left: 50%, transform: translateX(-50%)
            targetX = groupRect.left + groupRect.width / 2;
            targetY = groupRect.top + 20;
        } else if (tokenIndexInGroup === 1) {
            // CSS: bottom: 20px, left: 30px
            targetX = groupRect.left + 30;
            targetY = groupRect.top + groupRect.height - 20 - 60;
        } else {
            // CSS: bottom: 20px, right: 30px
            targetX = groupRect.left + groupRect.width - 30 - 60;
            targetY = groupRect.top + groupRect.height - 20 - 60;
        }

        // Clone the token for animation
        const animToken = tokenElement.cloneNode(true);
        animToken.style.position = 'fixed';
        animToken.style.left = `${pileRect.left}px`;
        animToken.style.top = `${pileRect.top}px`;
        animToken.style.zIndex = '1000';
        animToken.style.transition = 'all 0.5s ease-out';
        document.body.appendChild(animToken);

        // Remove original token from pile
        tokenElement.remove();

        // Trigger animation
        setTimeout(() => {
            animToken.style.left = `${targetX}px`;
            animToken.style.top = `${targetY}px`;
        }, 10);

        // After animation completes, convert to static token in the group
        setTimeout(() => {
            // Remove the animated token
            animToken.remove();

            // Add static token to the group
            const tokenDiv = document.createElement('div');
            tokenDiv.className = `token ${color}`;
            tokenDiv.style.transform = originalRotation;
            groupDiv.appendChild(tokenDiv);

            resolve();
        }, 520);
    });
}

// Update the display
function updateDisplay() {
    updateTokenCounter();
    updateTokenGroups();
    updateDiscardButton();
}

// Update the token pile - only called on init or restart
function updateTokenCounter() {
    const pileContainer = document.getElementById('tokenPile');
    pileContainer.innerHTML = '';
    gameState.pileTokenElements = [];

    const containerWidth = pileContainer.offsetWidth;
    const containerHeight = pileContainer.offsetHeight;

    // Create all tokens as a pile
    for (const [color, count] of Object.entries(gameState.remainingTokens)) {
        for (let i = 0; i < count; i++) {
            const tokenDiv = document.createElement('div');
            tokenDiv.className = `pile-token ${color}`;
            tokenDiv.dataset.color = color;

            // Random position within the container
            const randomX = Math.random() * (containerWidth - 60);
            const randomY = Math.random() * (containerHeight - 60);
            const randomRotation = Math.floor(Math.random() * 360);

            tokenDiv.style.left = `${randomX}px`;
            tokenDiv.style.top = `${randomY}px`;
            tokenDiv.style.transform = `rotate(${randomRotation}deg)`;

            pileContainer.appendChild(tokenDiv);
            gameState.pileTokenElements.push(tokenDiv);
        }
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
    drawNewTokensWithAnimation();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to restart the game?')) {
        initGame();
    }
});

// Start the game when page loads
initGame();
