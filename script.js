// --- 1. BASIC SETUP (UPDATED) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');

// Load all character images
const dragonImg = document.getElementById('dragon-sprite');
const catImg = document.getElementById('cat-sprite');
const robotImg = document.getElementById('robot-sprite');

// NEW: Load sound effect elements
const moveSound = document.getElementById('move-sound');
const gameOverSound = document.getElementById('game-over-sound');

// --- 2. GAME CONFIGURATION (Unchanged) ---
const TILE_SIZE = 40;
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;
canvas.width = MAP_NUM_COLS * TILE_SIZE;
canvas.height = MAP_NUM_ROWS * TILE_SIZE;

// --- 3. GAME STATE (Unchanged) ---
let isGameOver = false;
const player = { x: TILE_SIZE * 1, y: TILE_SIZE * 7, width: TILE_SIZE, height: TILE_SIZE, speed: 4, dx: 0, dy: 0, isMoving: false };
const cat = { img: catImg, x: TILE_SIZE * 18, y: TILE_SIZE * 1, width: TILE_SIZE, height: TILE_SIZE, speed: 4.4, dx: 0, dy: 0, decisionInterval: 200, lastDecisionTime: 0 };
const robot = { img: robotImg, x: TILE_SIZE * 18, y: TILE_SIZE * 13, width: TILE_SIZE, height: TILE_SIZE, speed: 3.6, dx: 0, dy: 0, decisionInterval: 350, lastDecisionTime: 0 };
const enemies = [cat, robot];
const levelMap = [ /* ... map data is unchanged ... */
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1], [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1], [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1], [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// --- 4. DRAWING FUNCTIONS (Unchanged) ---
function drawPlayer() { ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height); }
function drawMap() { for (let r=0; r<MAP_NUM_ROWS; r++) for (let c=0; c<MAP_NUM_COLS; c++) if(levelMap[r][c] === 1){ ctx.fillStyle = '#228B22'; ctx.fillRect(c*TILE_SIZE, r*TILE_SIZE, TILE_SIZE, TILE_SIZE); }}
function drawEnemies() { enemies.forEach(enemy => { ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height); }); }

// --- 5. GAME LOGIC (UPDATED) ---
// NEW: Function to play sounds safely
function playSound(sound) {
    // Reset the sound to the beginning to allow it to be played again quickly
    sound.currentTime = 0;
    sound.play().catch(error => {
        // Autoplay is often blocked by browsers until the user interacts with the page.
        // This catch block prevents a crash if the sound fails to play.
        console.log("Sound playback was prevented. User interaction might be required.", error);
    });
}

function checkPlayerEnemyCollision() {
    enemies.forEach(enemy => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {

            if (!isGameOver) {
                // Play the sound only once when the game ends
                playSound(gameOverSound);
                isGameOver = true;
            }
        }
    });
}

// Other game logic functions remain the same
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function movePlayer() { player.x += player.dx; player.y += player.dy; handleWallCollisions(player); }
function moveEnemies(currentTime) { enemies.forEach(enemy => { if (currentTime - enemy.lastDecisionTime > enemy.decisionInterval) { enemy.lastDecisionTime = currentTime; const xDist=player.x-enemy.x; const yDist=player.y-enemy.y; if (Math.abs(xDist)>Math.abs(yDist)) { enemy.dx=Math.sign(xDist)*enemy.speed; enemy.dy=0; } else { enemy.dy=Math.sign(yDist)*enemy.speed; enemy.dx=0; } } enemy.x+=enemy.dx; enemy.y+=enemy.dy; handleWallCollisions(enemy); }); }
function handleWallCollisions(character) { const originalDx = character.dx; const originalDy = character.dy; for (let r = 0; r < MAP_NUM_ROWS; r++) { for (let c = 0; c < MAP_NUM_COLS; c++) { if (levelMap[r][c] === 1) { const wall = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE }; if (character.x < wall.x + wall.width && character.x + character.width > wall.x && character.y < wall.y + wall.height && character.y + character.height > wall.y) { character.x -= originalDx; character.y -= originalDy; character.dx = 0; character.dy = 0; return; } } } } }
function showGameOver() { gameOverScreen.classList.add('visible'); }

// --- 6. INPUT HANDLERS (UPDATED) ---
// NEW: A function to handle starting movement to avoid duplicate code
function startMovement() {
    // Play the sound only on the transition from not moving to moving
    if (!player.isMoving && (player.dx !== 0 || player.dy !== 0)) {
        playSound(moveSound);
        player.isMoving = true;
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
    else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
    else if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed;
    else if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed;
    startMovement();
});

document.addEventListener('keyup', (e) => {
    if (['ArrowRight', 'd', 'ArrowLeft', 'a'].includes(e.key)) player.dx = 0;
    if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) player.dy = 0;
    // If both dx and dy are 0, the player has stopped moving
    if (player.dx === 0 && player.dy === 0) {
        player.isMoving = false;
    }
});

function addTouchAndMouseListeners(element, actionStart, actionEnd) {
    element.addEventListener('touchstart', (e) => { e.preventDefault(); actionStart(); startMovement(); }, { passive: false });
    element.addEventListener('touchend', (e) => { e.preventDefault(); actionEnd(); if (player.dx === 0 && player.dy === 0) player.isMoving = false; });
    element.addEventListener('mousedown', (e) => { e.preventDefault(); actionStart(); startMovement(); });
    element.addEventListener('mouseup', (e) => { e.preventDefault(); actionEnd(); if (player.dx === 0 && player.dy === 0) player.isMoving = false; });
    element.addEventListener('mouseleave', (e) => { e.preventDefault(); actionEnd(); if (player.dx === 0 && player.dy === 0) player.isMoving = false; });
}

addTouchAndMouseListeners(upBtn,    () => player.dy = -player.speed, () => player.dy = 0);
addTouchAndMouseListeners(downBtn,  () => player.dy = player.speed,  () => player.dy = 0);
addTouchAndMouseListeners(leftBtn,  () => player.dx = -player.speed, () => player.dx = 0);
addTouchAndMouseListeners(rightBtn, () => player.dx = player.speed,  () => player.dx = 0);

restartBtn.addEventListener('click', () => { location.reload(); });

// --- 7. THE GAME LOOP (Unchanged) ---
function update(currentTime = 0) {
    if (isGameOver) {
        showGameOver();
        return;
    }
    clearCanvas();
    drawMap();
    movePlayer();
    moveEnemies(currentTime);
    drawPlayer();
    drawEnemies();
    checkPlayerEnemyCollision();
    requestAnimationFrame(update);
}

// --- 8. START THE GAME (Unchanged) ---
drawMap();
function loadImage(imgElement) { return new Promise(resolve => { if (imgElement.complete) { resolve(); } else { imgElement.onload = resolve; imgElement.onerror = resolve; } }); }
Promise.all([ loadImage(dragonImg), loadImage(catImg), loadImage(robotImg) ]).then(() => { update(); });