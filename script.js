// --- 1. BASIC SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

// Load all character images
const dragonImg = document.getElementById('dragon-sprite');
const catImg = document.getElementById('cat-sprite');
const robotImg = document.getElementById('robot-sprite');

// --- 2. GAME CONFIGURATION ---
const TILE_SIZE = 40;
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;

canvas.width = MAP_NUM_COLS * TILE_SIZE;
canvas.height = MAP_NUM_ROWS * TILE_SIZE;

// --- 3. GAME STATE ---
let isGameOver = false;

const player = {
    x: TILE_SIZE * 1, y: TILE_SIZE * 7,
    width: TILE_SIZE, height: TILE_SIZE,
    speed: 4, dx: 0, dy: 0
};

// Enemy objects
const cat = {
    img: catImg,
    x: TILE_SIZE * 18, y: TILE_SIZE * 1,
    width: TILE_SIZE, height: TILE_SIZE,
    speed: 1.5, dx: 0, dy: 0
};

const robot = {
    img: robotImg,
    x: TILE_SIZE * 18, y: TILE_SIZE * 13,
    width: TILE_SIZE, height: TILE_SIZE,
    speed: 1, dx: 0, dy: 0
};

const enemies = [cat, robot];

// Level map remains the same
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
function drawMap() { /* ... same as before ... */
    for(let r=0; r<MAP_NUM_ROWS; r++) for(let c=0; c<MAP_NUM_COLS; c++) if(levelMap[r][c]===1){ ctx.fillStyle='#222'; ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE);}
}
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// --- 5. GAME LOGIC ---
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    handleWallCollisions(player);
}

// Simple AI to move enemies towards the player
function moveEnemies() {
    enemies.forEach(enemy => {
        // Simple "follow" logic
        if (player.x > enemy.x) enemy.dx = enemy.speed;
        else if (player.x < enemy.x) enemy.dx = -enemy.speed;
        else enemy.dx = 0;

        if (player.y > enemy.y) enemy.dy = enemy.speed;
        else if (player.y < enemy.y) enemy.dy = -enemy.speed;
        else enemy.dy = 0;

        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        handleWallCollisions(enemy);
    });
}

// Generic wall collision for any character (player or enemy)
function handleWallCollisions(character) {
    // Check collision with all wall tiles
    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            if (levelMap[r][c] === 1) {
                const wall = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                if (character.x < wall.x + wall.width && character.x + character.width > wall.x &&
                    character.y < wall.y + wall.height && character.y + character.height > wall.y) {
                    // On collision, move character back
                    character.x -= character.dx;
                    character.y -= character.dy;
                }
            }
        }
    }
}

// Check for collisions between player and enemies
function checkPlayerEnemyCollision() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            isGameOver = true;
        }
    });
}

function showGameOver() {
    gameOverScreen.classList.add('visible');
}

// --- 6. INPUT HANDLERS ---
// Keyboard, Touch, and Mouse controls are the same as before
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
const upBtn = document.getElementById('up-btn'), downBtn = document.getElementById('down-btn'), leftBtn = document.getElementById('left-btn'), rightBtn = document.getElementById('right-btn');
function addTouchAndMouseListeners(element, actionStart, actionEnd) {
    element.addEventListener('touchstart', (e) => { e.preventDefault(); actionStart(); }, { passive: false });
    element.addEventListener('touchend', (e) => { e.preventDefault(); actionEnd(); });
    element.addEventListener('mousedown', (e) => { e.preventDefault(); actionStart(); });
    element.addEventListener('mouseup', (e) => { e.preventDefault(); actionEnd(); });
    element.addEventListener('mouseleave', (e) => { e.preventDefault(); actionEnd(); });
}
addTouchAndMouseListeners(upBtn,    () => player.dy = -player.speed, () => player.dy = 0);
addTouchAndMouseListeners(downBtn,  () => player.dy = player.speed,  () => player.dy = 0);
addTouchAndMouseListeners(leftBtn,  () => player.dx = -player.speed, () => player.dx = 0);
addTouchAndMouseListeners(rightBtn, () => player.dx = player.speed,  () => player.dx = 0);

// Restart button listener
restartBtn.addEventListener('click', () => {
    location.reload(); // The simplest way to restart the game
});

// --- 7. THE GAME LOOP ---
function update() {
    if (isGameOver) {
        showGameOver();
        return; // Stop the game loop
    }

    clearCanvas();
    drawMap();
    movePlayer();
    moveEnemies(); // Move the new enemies
    drawPlayer();
    drawEnemies(); // Draw the new enemies
    checkPlayerEnemyCollision(); // Check if player is caught

    requestAnimationFrame(update);
}

// --- 8. START THE GAME ---
// Use Promise.all to wait for ALL images to load before starting
Promise.all([
    new Promise(resolve => dragonImg.onload = resolve),
    new Promise(resolve => catImg.onload = resolve),
    new Promise(resolve => robotImg.onload = resolve)
]).then(() => {
    update(); // Start the game loop
});