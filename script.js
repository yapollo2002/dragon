// --- 1. BASIC SETUP (Unchanged) ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');
const dragonImg = document.getElementById('dragon-sprite');
const catImg = document.getElementById('cat-sprite');
const robotImg = document.getElementById('robot-sprite');

// --- 2. GAME CONFIGURATION (Unchanged) ---
const TILE_SIZE = 40;
const MAP_NUM_ROWS = 15;
const MAP_NUM_COLS = 20;
canvas.width = MAP_NUM_COLS * TILE_SIZE;
canvas.height = MAP_NUM_ROWS * TILE_SIZE;

// --- 3. GAME STATE (UPDATED) ---
let isGameOver = false;

const player = {
    x: TILE_SIZE * 1, y: TILE_SIZE * 7,
    width: TILE_SIZE, height: TILE_SIZE,
    speed: 4, dx: 0, dy: 0
};

// Enemy objects now have properties for their AI decision-making
const cat = {
    img: catImg,
    x: TILE_SIZE * 18, y: TILE_SIZE * 1,
    width: TILE_SIZE, height: TILE_SIZE,
    speed: 4.4, dx: 0, dy: 0,
    decisionInterval: 200, // CHANGED: Thinks every 200ms
    lastDecisionTime: 0
};

const robot = {
    img: robotImg,
    x: TILE_SIZE * 18, y: TILE_SIZE * 13,
    width: TILE_SIZE, height: TILE_SIZE,
    speed: 3.6, dx: 0, dy: 0,
    decisionInterval: 350, // CHANGED: Thinks every 350ms (a bit slower than the cat)
    lastDecisionTime: 0
};

const enemies = [cat, robot];
const levelMap = [ /* ... map data is unchanged ... */
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1], [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1], [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1], [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1], [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1], [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// --- 4. DRAWING FUNCTIONS (UPDATED) ---
function drawPlayer() { ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height); }
function drawMap() {
    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            if (levelMap[r][c] === 1) {
                // CHANGED: Wall color is now a forest green
                ctx.fillStyle = '#228B22';
                ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}
function drawEnemies() {
    enemies.forEach(enemy => { ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height); });
}

// --- 5. GAME LOGIC (UPDATED) ---
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;
    handleWallCollisions(player);
}

// NEW smarter AI logic
function moveEnemies(currentTime) {
    enemies.forEach(enemy => {
        // Check if it's time for this enemy to make a new decision
        if (currentTime - enemy.lastDecisionTime > enemy.decisionInterval) {
            enemy.lastDecisionTime = currentTime;

            // Decide direction based on player's position
            const xDist = player.x - enemy.x;
            const yDist = player.y - enemy.y;

            // Prioritize the axis with the greater distance
            if (Math.abs(xDist) > Math.abs(yDist)) {
                enemy.dx = Math.sign(xDist) * enemy.speed;
                enemy.dy = 0;
            } else {
                enemy.dy = Math.sign(yDist) * enemy.speed;
                enemy.dx = 0;
            }
        }

        // Move the enemy every frame based on its last decision
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        handleWallCollisions(enemy);
    });
}

// Generic wall collision function is now more important
function handleWallCollisions(character) {
    // We store the original dx/dy to revert if needed
    const originalDx = character.dx;
    const originalDy = character.dy;

    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            if (levelMap[r][c] === 1) {
                const wall = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                if (character.x < wall.x + wall.width && character.x + character.width > wall.x &&
                    character.y < wall.y + wall.height && character.y + character.height > wall.y) {

                    // On collision, move character back and stop its movement
                    character.x -= originalDx;
                    character.y -= originalDy;
                    character.dx = 0;
                    character.dy = 0;
                    return; // Exit after finding one collision
                }
            }
        }
    }
}

function checkPlayerEnemyCollision() { /* ... same as before ... */
    enemies.forEach(enemy => { if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x && player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) { isGameOver = true; } });
}

function showGameOver() { gameOverScreen.classList.add('visible'); }

// --- 6. INPUT HANDLERS (Unchanged) ---
document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed; else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed; else if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed; else if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed; });
document.addEventListener('keyup', (e) => { if (['ArrowRight', 'd', 'ArrowLeft', 'a'].includes(e.key)) player.dx = 0; if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) player.dy = 0; });
const upBtn = document.getElementById('up-btn'), downBtn = document.getElementById('down-btn'), leftBtn = document.getElementById('left-btn'), rightBtn = document.getElementById('right-btn');
function addTouchAndMouseListeners(element, actionStart, actionEnd) { element.addEventListener('touchstart', (e) => { e.preventDefault(); actionStart(); }, { passive: false }); element.addEventListener('touchend', (e) => { e.preventDefault(); actionEnd(); }); element.addEventListener('mousedown', (e) => { e.preventDefault(); actionStart(); }); element.addEventListener('mouseup', (e) => { e.preventDefault(); actionEnd(); }); element.addEventListener('mouseleave', (e) => { e.preventDefault(); actionEnd(); }); }
addTouchAndMouseListeners(upBtn,    () => player.dy = -player.speed, () => player.dy = 0);
addTouchAndMouseListeners(downBtn,  () => player.dy = player.speed,  () => player.dy = 0);
addTouchAndMouseListeners(leftBtn,  () => player.dx = -player.speed, () => player.dx = 0);
addTouchAndMouseListeners(rightBtn, () => player.dx = player.speed,  () => player.dx = 0);
restartBtn.addEventListener('click', () => { location.reload(); });

// --- 7. THE GAME LOOP (UPDATED) ---
// The loop now passes the current time to the moveEnemies function
function update(currentTime = 0) {
    if (isGameOver) {
        showGameOver();
        return;
    }

    clearCanvas();
    drawMap();
    movePlayer();
    moveEnemies(currentTime); // Pass the time to the AI
    drawPlayer();
    drawEnemies();
    checkPlayerEnemyCollision();

    requestAnimationFrame(update);
}

// --- 8. START THE GAME (Unchanged) ---
Promise.all([
    new Promise(resolve => dragonImg.onload = resolve),
    new Promise(resolve => catImg.onload = resolve),
    new Promise(resolve => robotImg.onload = resolve)
]).then(() => {
    update();
});