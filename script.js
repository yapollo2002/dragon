// --- 1. BASIC SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const dragonImg = document.getElementById('dragon-sprite');

// --- 2. GAME CONFIGURATION ---
const TILE_SIZE = 40; // The size in pixels of each grid square
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;

// Set the canvas dimensions based on the grid size
canvas.width = MAP_NUM_COLS * TILE_SIZE;
canvas.height = MAP_NUM_ROWS * TILE_SIZE;

// --- 3. GAME STATE (Player and Level) ---
const player = {
    x: TILE_SIZE * 1, // Start at column 1
    y: TILE_SIZE * 7, // Start at row 7
    width: TILE_SIZE,
    height: TILE_SIZE,
    speed: 4,
    dx: 0, // Current speed in x-direction (horizontal)
    dy: 0  // Current speed in y-direction (vertical)
};

// The level layout: 1 represents a wall, 0 represents an open path
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

// --- 4. DRAWING FUNCTIONS ---
function drawPlayer() { ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height); }

function drawMap() {
    for (let row = 0; row < MAP_NUM_ROWS; row++) {
        for (let col = 0; col < MAP_NUM_COLS; col++) {
            if (levelMap[row][col] === 1) { // Check if the tile is a wall
                ctx.fillStyle = '#222';
                ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// --- 5. GAME LOGIC ---
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    handleCollisions();
}

function handleCollisions() {
    for (let row = 0; row < MAP_NUM_ROWS; row++) {
        for (let col = 0; col < MAP_NUM_COLS; col++) {
            if (levelMap[row][col] === 1) { // Check only against wall tiles
                const wall = { x: col * TILE_SIZE, y: row * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                if (
                    player.x < wall.x + wall.width && player.x + player.width > wall.x &&
                    player.y < wall.y + wall.height && player.y + player.height > wall.y
                ) {
                    // If a collision occurs, revert the movement
                    player.x -= player.dx;
                    player.y -= player.dy;
                    // Stop movement
                    player.dx = 0;
                    player.dy = 0;
                }
            }
        }
    }
}

// --- 6. INPUT HANDLERS ---
// Keyboard Controls (for desktop)
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
    else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    else if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    else if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
});

document.addEventListener('keyup', (e) => {
    if (['ArrowRight', 'd', 'ArrowLeft', 'a'].includes(e.key)) player.dx = 0;
    if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) player.dy = 0;
});

// Touch and Mouse Controls for On-Screen Buttons
const upBtn = document.getElementById('up-btn');
const downBtn = document.getElementById('down-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

function addTouchAndMouseListeners(element, actionStart, actionEnd) {
    // Mobile touch events
    element.addEventListener('touchstart', (e) => { e.preventDefault(); actionStart(); }, { passive: false });
    element.addEventListener('touchend', (e) => { e.preventDefault(); actionEnd(); });
    // Desktop mouse events
    element.addEventListener('mousedown', (e) => { e.preventDefault(); actionStart(); });
    element.addEventListener('mouseup', (e) => { e.preventDefault(); actionEnd(); });
    element.addEventListener('mouseleave', (e) => { e.preventDefault(); actionEnd(); });
}

addTouchAndMouseListeners(upBtn,    () => player.dy = -player.speed, () => player.dy = 0);
addTouchAndMouseListeners(downBtn,  () => player.dy = player.speed,  () => player.dy = 0);
addTouchAndMouseListeners(leftBtn,  () => player.dx = -player.speed, () => player.dx = 0);
addTouchAndMouseListeners(rightBtn, () => player.dx = player.speed,  () => player.dx = 0);

// --- 7. THE GAME LOOP ---
function update() {
    clearCanvas();  // Erase the previous frame
    drawMap();      // Draw the walls/background
    movePlayer();   // Update player position and check collisions
    drawPlayer();   // Draw the player in the new position
    requestAnimationFrame(update); // Request the next frame, creating the loop
}

// --- 8. START THE GAME ---
// Wait for the dragon image to fully load before starting the game loop
dragonImg.onload = () => {
    update();
};
// Fallback if the image is already cached by the browser
if (dragonImg.complete) {
    update();
}