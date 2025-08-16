// --- 1. BASIC SETUP ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');
const dragonImg = document.getElementById('dragon-sprite');
const catImg = document.getElementById('cat-sprite');
const robotImg = document.getElementById('robot-sprite');
const moveSound = document.getElementById('move-sound');
const gameOverSound = document.getElementById('game-over-sound');

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
    speed: 4, dx: 0, dy: 0, isMoving: false
};
// We bring back the decision interval logic for the "smarter" AI
const cat = {
    img: catImg, x: TILE_SIZE * 18, y: TILE_SIZE * 1,
    width: TILE_SIZE, height: TILE_SIZE, speed: 4.4, dx: 0, dy: 0,
    decisionInterval: 75, lastDecisionTime: 0
};
const robot = {
    img: robotImg, x: TILE_SIZE * 18, y: TILE_SIZE * 13,
    width: TILE_SIZE, height: TILE_SIZE, speed: 3.6, dx: 0, dy: 0,
    decisionInterval: 125, lastDecisionTime: 0
};
const allCharacters = [player, cat, robot];
const enemies = [cat, robot];
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
function draw() { clearCanvas(); drawMap(); drawEnemies(); drawPlayer(); }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function drawPlayer() { ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height); }
function drawMap() { for (let r = 0; r < MAP_NUM_ROWS; r++) { for (let c = 0; c < MAP_NUM_COLS; c++) { if (levelMap[r][c] === 1) { ctx.fillStyle = '#228B22'; ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE); } } } }
function drawEnemies() { enemies.forEach(enemy => { ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height); }); }

// --- 5. GAME LOGIC (FINAL) ---
function playSound(sound) { sound.currentTime = 0; sound.play().catch(error => { console.log("Sound playback was prevented.", error); }); }
function checkPlayerEnemyCollision() { enemies.forEach(enemy => { if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x && player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) { if (!isGameOver) { playSound(gameOverSound); isGameOver = true; } } }); }

// This is the AI "Brain" from the version you liked.
function updateEnemyIntentions(currentTime) {
    enemies.forEach(enemy => {
        // Only make a new decision if the timer is up
        if (currentTime - enemy.lastDecisionTime > enemy.decisionInterval) {
            enemy.lastDecisionTime = currentTime;

            const xDist = player.x - enemy.x;
            const yDist = player.y - enemy.y;

            if (Math.abs(xDist) > Math.abs(yDist)) {
                enemy.dx = Math.sign(xDist) * enemy.speed;
                enemy.dy = 0;
            } else {
                enemy.dy = Math.sign(yDist) * enemy.speed;
                enemy.dx = 0;
            }

            // If the chosen path is blocked, immediately try the other direction
            if (willCollide(enemy, enemy.dx, enemy.dy)) {
                if (enemy.dx !== 0) { // Was trying horizontal
                    enemy.dx = 0;
                    enemy.dy = Math.sign(yDist) * enemy.speed;
                } else { // Was trying vertical
                    enemy.dy = 0;
                    enemy.dx = Math.sign(xDist) * enemy.speed;
                }
            }
        }
    });
}

// This helper function checks a characters FUTURE position.
function willCollide(character, dx, dy) {
    const nextX = character.x + dx;
    const nextY = character.y + dy;
    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            if (levelMap[r][c] === 1) {
                const wall = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                if (nextX < wall.x + wall.width && nextX + character.width > wall.x &&
                    nextY < wall.y + wall.height && nextY + character.height > wall.y) {
                    return true;
                }
            }
        }
    }
    return false;
}

// This is the perfect "Body" (collision system) that allows sliding.
function updatePositions() {
    allCharacters.forEach(char => {
        if (char.dx === 0 && char.dy === 0) return;

        // Move on X axis
        char.x += char.dx;
        // Check for X collision
        for (let r = 0; r < MAP_NUM_ROWS; r++) {
            for (let c = 0; c < MAP_NUM_COLS; c++) {
                if (levelMap[r][c] === 1) {
                    const wall = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                    if (char.x < wall.x + wall.width && char.x + char.width > wall.x &&
                        char.y < wall.y + wall.height && char.y + char.height > wall.y) {
                        char.x -= char.dx; // Revert X move
                        break;
                    }
                }
            }
        }

        // Move on Y axis
        char.y += char.dy;
        // Check for Y collision
         for (let r = 0; r < MAP_NUM_ROWS; r++) {
            for (let c = 0; c < MAP_NUM_COLS; c++) {
                if (levelMap[r][c] === 1) {
                    const wall = { x: c * TILE_SIZE, y: r * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE };
                     if (char.x < wall.x + wall.width && char.x + char.width > wall.x &&
                        char.y < wall.y + wall.height && char.y + char.height > wall.y) {
                        char.y -= char.dy; // Revert Y move
                        break;
                    }
                }
            }
        }
    });
}

function showGameOver() { gameOverScreen.classList.add('visible'); }

// --- 6. INPUT HANDLERS ---
function startMovement() { if (!player.isMoving && (player.dx !== 0 || player.dy !== 0)) { playSound(moveSound); player.isMoving = true; } }
document.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed; else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed; else if (e.key === 'ArrowUp' || e.key === 'w') player.dy = -player.speed; else if (e.key === 'ArrowDown' || e.key === 's') player.dy = player.speed; startMovement(); });
document.addEventListener('keyup', (e) => { if (['ArrowRight', 'd', 'ArrowLeft', 'a'].includes(e.key)) player.dx = 0; if (['ArrowUp', 'w', 'ArrowDown', 's'].includes(e.key)) player.dy = 0; if (player.dx === 0 && player.dy === 0) { player.isMoving = false; } });
const upBtn = document.getElementById('up-btn'), downBtn = document.getElementById('down-btn'), leftBtn = document.getElementById('left-btn'), rightBtn = document.getElementById('right-btn');
function addTouchAndMouseListeners(element, actionStart, actionEnd) { element.addEventListener('touchstart', (e) => { e.preventDefault(); actionStart(); startMovement(); }, { passive: false }); element.addEventListener('touchend', (e) => { e.preventDefault(); actionEnd(); if (player.dx === 0 && player.dy === 0) player.isMoving = false; }); element.addEventListener('mousedown', (e) => { e.preventDefault(); actionStart(); startMovement(); }); element.addEventListener('mouseup', (e) => { e.preventDefault(); actionEnd(); if (player.dx === 0 && player.dy === 0) player.isMoving = false; }); element.addEventListener('mouseleave', (e) => { e.preventDefault(); actionEnd(); if (player.dx === 0 && player.dy === 0) player.isMoving = false; }); }
addTouchAndMouseListeners(upBtn,    () => player.dy = -player.speed, () => player.dy = 0);
addTouchAndMouseListeners(downBtn,  () => player.dy = player.speed,  () => player.dy = 0);
addTouchAndMouseListeners(leftBtn,  () => player.dx = -player.speed, () => player.dx = 0);
addTouchAndMouseListeners(rightBtn, () => player.dx = player.speed,  () => player.dx = 0);
restartBtn.addEventListener('click', () => { location.reload(); });

// --- 7. THE GAME LOOP ---
function update(currentTime = 0) {
    if (isGameOver) {
        showGameOver();
        return;
    }
    updateEnemyIntentions(currentTime);
    updatePositions();
    checkPlayerEnemyCollision();
    draw();
    requestAnimationFrame(update);
}

// --- 8. START THE GAME ---
window.addEventListener('DOMContentLoaded', () => {
    drawMap();
    function loadImage(imgElement) { return new Promise(resolve => { if (imgElement.complete) { resolve(); } else { imgElement.onload = resolve; imgElement.onerror = resolve; } }); }
    Promise.all([ loadImage(dragonImg), loadImage(catImg), loadImage(robotImg) ]).then(() => { update(); });
});```