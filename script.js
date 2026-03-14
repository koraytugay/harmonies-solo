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

// Update token bar
function updateTokenCount() {
    const tokenBar = document.getElementById('tokenBar');
    tokenBar.innerHTML = '';

    // Order: yellow, red, green, gray, brown, blue
    const colorOrder = ['yellow', 'red', 'green', 'gray', 'brown', 'blue'];
    const total = 120;

    colorOrder.forEach(color => {
        const count = gameState.remainingTokens[color];
        const percentage = (count / total) * 100;

        const segment = document.createElement('div');
        segment.className = `token-segment ${color}`;
        segment.style.width = `${percentage}%`;
        tokenBar.appendChild(segment);
    });
}

// Update draw button state
function updateDrawButton() {
    // Button removed - Enter key is now used for drawing
    // No action needed
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
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const total = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
        if (total >= 9) {
            drawNewTokens();
        }
    }
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

// Debug: Log circle center positions
setTimeout(() => {
    const groups = document.querySelectorAll('.group');
    groups.forEach((group, index) => {
        const rect = group.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        console.log(`Circle ${index + 1} center: (${Math.round(centerX)}, ${Math.round(centerY)})`);
    });

    // Calculate distances between centers
    const group1 = document.querySelectorAll('.group')[0].getBoundingClientRect();
    const group2 = document.querySelectorAll('.group')[1].getBoundingClientRect();
    const group3 = document.querySelectorAll('.group')[2].getBoundingClientRect();

    const center1 = { x: group1.left + group1.width / 2, y: group1.top + group1.height / 2 };
    const center2 = { x: group2.left + group2.width / 2, y: group2.top + group2.height / 2 };
    const center3 = { x: group3.left + group3.width / 2, y: group3.top + group3.height / 2 };

    const dist12 = Math.sqrt(Math.pow(center2.x - center1.x, 2) + Math.pow(center2.y - center1.y, 2));
    const dist13 = Math.sqrt(Math.pow(center3.x - center1.x, 2) + Math.pow(center3.y - center1.y, 2));
    const dist23 = Math.sqrt(Math.pow(center3.x - center2.x, 2) + Math.pow(center3.y - center2.y, 2));

    console.log(`Distance 1-2: ${Math.round(dist12)}px`);
    console.log(`Distance 1-3: ${Math.round(dist13)}px`);
    console.log(`Distance 2-3: ${Math.round(dist23)}px`);
}, 100);
