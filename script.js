// --- Basic Setup ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dragonImg = document.getElementById('dragon-sprite');

// --- Game Configuration ---
const TILE_SIZE = 40; // The size of each grid cell in pixels
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;

// Set canvas dimensions based on the grid
canvas.width = MAP_NUM_COLS * TILE_SIZE;
canvas.height = MAP_NUM_ROWS * TILE_SIZE;

// --- Game Objects ---

// The player (dragon) object
const player = {
    x: TILE_SIZE * 1, // Starting X position on the grid
    y: TILE_SIZE * 7, // Starting Y position on the grid
    width: TILE_SIZE,
    height: TILE_SIZE,
    speed: 4,
    dx: 0, // Change in x-direction
    dy: 0  // Change in y-direction
};

// The level layout (1 = wall, 0 = path)
const levelMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// --- Drawing Functions ---

// Draw the player
function drawPlayer() {
    ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height);
}

// Draw the level map
function drawMap() {
    for (let row = 0; row < MAP_NUM_ROWS; row++) {
        for (let col = 0; col < MAP_NUM_COLS; col++) {
            const tile = levelMap[row][col];
            if (tile === 1) { // If it's a wall tile
                ctx.fillStyle = '#222'; // Darker grey for walls
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// --- Game Logic Functions ---

// Clear the canvas for the next frame
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Update player's position
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Check for collision after moving
    handleCollisions();
}

// Collision detection with the walls
function handleCollisions() {
    for (let row = 0; row < MAP_NUM_ROWS; row++) {
        for (let col = 0; col < MAP_NUM_COLS; col++) {
            const tile = levelMap[row][col];
            if (tile === 1) { // Is it a wall?
                const wall = {
                    x: col * TILE_SIZE,
                    y: row * TILE_SIZE,
                    width: TILE_SIZE,
                    height: TILE_SIZE
                };

                // Check for collision between player and wall
                if (
                    player.x < wall.x + wall.width &&
                    player.x + player.width > wall.x &&
                    player.y < wall.y + wall.height &&
                    player.y + player.height > wall.y
                ) {
                    // Collision detected! Move player back to previous position
                    player.x -= player.dx;
                    player.y -= player.dy;
                    // Stop further movement in this frame
                    player.dx = 0;
                    player.dy = 0;
                }
            }
        }
    }
}

// --- Keyboard Input ---
function handleKeyDown(e) {
    // Prevent default browser actions for arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
    }

    // Set movement direction
    if (e.key === 'ArrowRight' || e.key === 'd') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.dx = -player.speed;
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        player.dy = -player.speed;
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        player.dy = player.speed;
    }
}

function handleKeyUp(e) {
    // Stop movement when key is released
    if (
        e.key === 'ArrowRight' || e.key === 'd' ||
        e.key === 'ArrowLeft' || e.key === 'a'
    ) {
        player.dx = 0;
    }
    if (
        e.key === 'ArrowUp' || e.key === 'w' ||
        e.key === 'ArrowDown' || e.key === 's'
    ) {
        player.dy = 0;
    }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);


// --- The Game Loop ---
function update() {
    clearCanvas();

    drawMap(); // Draw the background first

    movePlayer();

    drawPlayer(); // Draw the player on top

    // This creates a continuous loop for animation
    requestAnimationFrame(update);
}

// Start the game loop only after the image has fully loaded
dragonImg.onload = () => {
    update();
};

// A fallback in case the image is already cached and the 'onload' doesn't fire
if (dragonImg.complete) {
    update();
}