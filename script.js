// Harmonies Solo - Simple & Clean

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
    updateTokenCount();
    updateDrawButton();
}

// Update token count display
function updateTokenCount() {
    const total = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
    document.getElementById('tokenCountDisplay').textContent = `${total} tokens remaining`;
}

// Update draw button state
function updateDrawButton() {
    const total = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.disabled = total < 9;
}

// Discard tokens - fall down animation
async function discardTokens() {
    const allTokens = document.querySelectorAll('.group-tokens .token');

    if (allTokens.length === 0) return;

    const fallPromises = [];
    allTokens.forEach((token, index) => {
        const promise = new Promise(resolve => {
            const rect = token.getBoundingClientRect();

            // Create falling clone
            const fallToken = token.cloneNode(true);
            fallToken.style.position = 'fixed';
            fallToken.style.left = `${rect.left}px`;
            fallToken.style.top = `${rect.top}px`;
            fallToken.style.zIndex = '1000';
            fallToken.style.transition = 'all 1s ease-in';
            document.body.appendChild(fallToken);

            // Hide original
            token.style.opacity = '0';

            // Fall animation
            setTimeout(() => {
                fallToken.style.top = `${window.innerHeight + 100}px`;
                fallToken.style.transform = `rotate(${(Math.random() - 0.5) * 720}deg)`;
            }, index * 60);

            setTimeout(() => {
                fallToken.remove();
                resolve();
            }, 1000 + (index * 60));
        });
        fallPromises.push(promise);
    });

    await Promise.all(fallPromises);

    // Clear all groups
    document.querySelectorAll('.group-tokens').forEach(container => {
        container.innerHTML = '';
    });
}

// Draw new tokens - fade in animation
async function drawNewTokens() {
    const total = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
    if (total < 9) {
        alert('Not enough tokens remaining!');
        return;
    }

    // Discard current tokens
    await discardTokens();

    // Select 9 random tokens
    const tokenPool = [];
    for (const [color, count] of Object.entries(gameState.remainingTokens)) {
        for (let i = 0; i < count; i++) {
            tokenPool.push(color);
        }
    }

    const selectedTokens = [];
    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * tokenPool.length);
        const color = tokenPool[randomIndex];
        selectedTokens.push(color);
        tokenPool.splice(randomIndex, 1);
        gameState.remainingTokens[color]--;
    }

    // Group into 3 groups of 3
    gameState.currentTokens = [
        selectedTokens.slice(0, 3),
        selectedTokens.slice(3, 6),
        selectedTokens.slice(6, 9)
    ];

    // Add tokens with fade-in animation
    const groups = document.querySelectorAll('.group');
    for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
        const tokenContainer = groups[groupIndex].querySelector('.group-tokens');
        const tokens = gameState.currentTokens[groupIndex];

        for (let tokenIndex = 0; tokenIndex < 3; tokenIndex++) {
            await new Promise(resolve => {
                const token = document.createElement('div');
                token.className = `token ${tokens[tokenIndex]}`;
                token.style.opacity = '0';
                token.style.transform = 'scale(0.8)';
                token.style.transition = 'all 0.4s ease-out';

                // Random rotation
                const rotation = Math.floor(Math.random() * 360);
                token.dataset.rotation = rotation;

                tokenContainer.appendChild(token);

                setTimeout(() => {
                    token.style.opacity = '1';
                    token.style.transform = `scale(1) rotate(${rotation}deg)`;
                }, 10);

                setTimeout(resolve, 150);
            });
        }
    }

    updateTokenCount();
    updateDrawButton();
}

// Event Listeners
document.getElementById('drawBtn').addEventListener('click', () => {
    drawNewTokens();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to restart the game?')) {
        // Clear all groups
        document.querySelectorAll('.group-tokens').forEach(container => {
            container.innerHTML = '';
        });
        initGame();
    }
});

// Start the game
initGame();
