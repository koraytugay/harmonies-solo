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
    currentTokens: [],
    isDrawing: false
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
            const currentTransform = window.getComputedStyle(token).transform;

            // Calculate center of original token
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Hide original immediately
            token.style.opacity = '0';
            token.style.transition = 'none';

            // Create falling clone positioned at center
            const fallToken = document.createElement('div');
            fallToken.className = token.className;
            fallToken.style.position = 'fixed';
            // Position so that the center of the 75x75 element is at the original center
            fallToken.style.left = `${centerX - 37.5}px`;
            fallToken.style.top = `${centerY - 37.5}px`;
            fallToken.style.transform = currentTransform;
            fallToken.style.zIndex = '1000';
            fallToken.style.transition = 'none';
            document.body.appendChild(fallToken);

            // Force reflow
            fallToken.offsetHeight;
            fallToken.style.transition = 'top 1s ease-in, transform 1s ease-in';

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

// Draw new tokens with falling animation for old tokens
async function drawNewTokens() {
    // Prevent multiple simultaneous draws
    if (gameState.isDrawing) return;

    const total = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
    if (total < 9) {
        alert('Not enough tokens remaining!');
        return;
    }

    gameState.isDrawing = true;

    // Discard current tokens with falling animation
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

    // Add tokens with fade-in
    const groups = document.querySelectorAll('.group');
    for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
        const tokenContainer = groups[groupIndex].querySelector('.group-tokens');
        const tokens = gameState.currentTokens[groupIndex];

        for (let tokenIndex = 0; tokenIndex < 3; tokenIndex++) {
            const token = document.createElement('div');
            token.className = `token ${tokens[tokenIndex]}`;

            // Random rotation - set immediately
            const rotation = Math.floor(Math.random() * 360);
            token.style.transform = `rotate(${rotation}deg)`;

            // Start invisible
            token.style.opacity = '0';
            token.style.transition = 'opacity 1.5s ease-out';

            tokenContainer.appendChild(token);

            // Fade in after a tiny delay
            setTimeout(() => {
                token.style.opacity = '1';
            }, 10);
        }
    }

    updateTokenCount();
    updateDrawButton();

    gameState.isDrawing = false;
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        closeToast();
        const total = Object.values(gameState.remainingTokens).reduce((a, b) => a + b, 0);
        if (total >= 9) {
            drawNewTokens();
        }
    }
});

// Toast functions
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
}

function closeToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
    toast.classList.add('falling');

    // Remove falling class after animation completes
    setTimeout(() => {
        toast.classList.remove('falling');
    }, 1200);
}

// Start the game
initGame();

// Show welcome toast on page load
setTimeout(() => {
    showToast();
}, 100);

