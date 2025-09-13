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
const cat = {
    img: catImg, x: TILE_SIZE * 18, y: TILE_SIZE * 1,
    width: TILE_SIZE, height: TILE_SIZE, speed: 4.4, dx: 0, dy: 0,
    path: [], // <<<<<< This will store the cat's calculated route
    pathRecalculationInterval: 500, // Recalculate every 500ms
    lastPathRecalculationTime: 0
};
const robot = {
    img: robotImg, x: TILE_SIZE * 18, y: TILE_SIZE * 13,
    width: TILE_SIZE, height: TILE_SIZE, speed: 3.6, dx: 0, dy: 0,
    path: [], // <<<<<< This will store the robot's calculated route
    pathRecalculationInterval: 500, // Recalculate every 500ms
    lastPathRecalculationTime: 0
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

// --- 4. DRAWING FUNCTIONS (UPDATED) ---
function draw() {
    clearCanvas();
    drawMap();
    drawPaths(); // <<<<<< NEW: Draw the visualized path
    drawEnemies();
    drawPlayer();
}
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }
function drawPlayer() { ctx.drawImage(dragonImg, player.x, player.y, player.width, player.height); }
function drawMap() { for (let r = 0; r < MAP_NUM_ROWS; r++) { for (let c = 0; c < MAP_NUM_COLS; c++) { if (levelMap[r][c] === 1) { ctx.fillStyle = '#228B22'; ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE); } } } }
function drawEnemies() { enemies.forEach(enemy => { ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height); }); }

// NEW: This function draws the path on the screen for debugging
function drawPaths() {
    enemies.forEach(enemy => {
        // Use a different color for each enemy's path
        ctx.fillStyle = (enemy === cat) ? 'rgba(255, 165, 0, 0.5)' : 'rgba(135, 206, 250, 0.5)';

        enemy.path.forEach(step => {
            const centerX = step.x * TILE_SIZE + TILE_SIZE / 2;
            const centerY = step.y * TILE_SIZE + TILE_SIZE / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, TILE_SIZE / 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    });
}


// --- 5. A* PATHFINDING ALGORITHM ---
function astar(grid, start, end) {
    const nodes = [];
    for (let r = 0; r < MAP_NUM_ROWS; r++) {
        nodes[r] = [];
        for (let c = 0; c < MAP_NUM_COLS; c++) {
            nodes[r][c] = { x: c, y: r, g: Infinity, h: 0, f: Infinity, parent: null, isWall: grid[r][c] === 1 };
        }
    }

    const startNode = nodes[start.y][start.x];
    const endNode = nodes[end.y][end.x];
    startNode.g = 0;
    startNode.h = Math.abs(startNode.x - endNode.x) + Math.abs(startNode.y - endNode.y);
    startNode.f = startNode.g + startNode.h;

    const openSet = [startNode];
    const closedSet = [];

    while (openSet.length > 0) {
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIndex].f) { lowestIndex = i; }
        }
        const currentNode = openSet[lowestIndex];

        if (currentNode === endNode) {
            const path = [];
            let temp = currentNode;
            while (temp.parent) {
                path.push(temp);
                temp = temp.parent;
            }
            return path.reverse();
        }

        openSet.splice(lowestIndex, 1);
        closedSet.push(currentNode);

        const neighbors = [];
        const { x, y } = currentNode;
        if (y > 0) neighbors.push(nodes[y - 1][x]);
        if (y < MAP_NUM_ROWS - 1) neighbors.push(nodes[y + 1][x]);
        if (x > 0) neighbors.push(nodes[y][x - 1]);
        if (x < MAP_NUM_COLS - 1) neighbors.push(nodes[y][x + 1]);

        for (const neighbor of neighbors) {
            if (neighbor.isWall || closedSet.includes(neighbor)) continue;
            const tentativeG = currentNode.g + 1;
            if (tentativeG < neighbor.g) {
                neighbor.parent = currentNode;
                neighbor.g = tentativeG;
                neighbor.h = Math.abs(neighbor.x - endNode.x) + Math.abs(neighbor.y - endNode.y);
                neighbor.f = neighbor.g + neighbor.h;
                if (!openSet.includes(neighbor)) { openSet.push(neighbor); }
            }
        }
    }
    return []; // No path found
}


// --- 6. GAME LOGIC ---
function playSound(sound) { sound.currentTime = 0; sound.play().catch(error => { console.log("Sound playback was prevented.", error); }); }
function checkPlayerEnemyCollision() { enemies.forEach(enemy => { if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x && player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) { if (!isGameOver) { playSound(gameOverSound); isGameOver = true; } } }); }

// The "Brain": Recalculates the A* path on a timer
function updateAI(currentTime) {
    enemies.forEach(enemy => {
        if (currentTime - enemy.lastPathRecalculationTime > enemy.pathRecalculationInterval) {
            enemy.lastPathRecalculationTime = currentTime;

            const startCol = Math.round(enemy.x / TILE_SIZE);
            const startRow = Math.round(enemy.y / TILE_SIZE);
            const endCol = Math.round(player.x / TILE_SIZE);
            const endRow = Math.round(player.y / TILE_SIZE);

            if (startCol !== endCol || startRow !== endRow) {
                 enemy.path = astar(levelMap, {x: startCol, y: startRow}, {x: endCol, y: endRow});
            }
        }
    });
}

// The "Body": Follows the pre-calculated path
function followPath() {
    enemies.forEach(enemy => {
        if (enemy.path.length === 0) {
            enemy.dx = 0;
            enemy.dy = 0;
            return;
        }

        const nextStep = enemy.path[0];
        const targetX = nextStep.x * TILE_SIZE;
        const targetY = nextStep.y * TILE_SIZE;

        const vecX = targetX - enemy.x;
        const vecY = targetY - enemy.y;
        const distance = Math.sqrt(vecX * vecX + vecY * vecY);

        if (distance < enemy.speed) {
            enemy.path.shift();
        } else {
            const normalizedX = vecX / distance;
            const normalizedY = vecY / distance;
            enemy.dx = normalizedX * enemy.speed;
            enemy.dy = normalizedY * enemy.speed;
        }
    });
}

// The robust collision system
function updatePositions() {
    allCharacters.forEach(char => {
        if (char.dx === 0 && char.dy === 0) return;
        char.x += char.dx;
        for (let r=0;r<MAP_NUM_ROWS;r++) for(let c=0;c<MAP_NUM_COLS;c++) if(levelMap[r][c]===1){const wall={x:c*TILE_SIZE,y:r*TILE_SIZE,width:TILE_SIZE,height:TILE_SIZE};if(char.x<wall.x+wall.width&&char.x+char.width>wall.x&&char.y<wall.y+wall.height&&char.y+char.height>wall.y){if(char.dx>0)char.x=wall.x-char.width;else if(char.dx<0)char.x=wall.x+wall.width;break;}}
        char.y += char.dy;
        for (let r=0;r<MAP_NUM_ROWS;r++) for(let c=0;c<MAP_NUM_COLS;c++) if(levelMap[r][c]===1){const wall={x:c*TILE_SIZE,y:r*TILE_SIZE,width:TILE_SIZE,height:TILE_SIZE};if(char.x<wall.x+wall.width&&char.x+char.width>wall.x&&char.y<wall.y+wall.height&&char.y+char.height>wall.y){if(char.dy>0)char.y=wall.y-char.height;else if(char.dy<0)char.y=wall.y+wall.height;break;}}
    });
}

function showGameOver() { gameOverScreen.classList.add('visible'); }

// --- 7. INPUT HANDLERS ---
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

// --- 8. THE GAME LOOP ---
function update(currentTime = 0) {
    if (isGameOver) {
        showGameOver();
        return;
    }
    updateAI(currentTime);
    followPath();
    updatePositions();
    checkPlayerEnemyCollision();
    draw();
    requestAnimationFrame(update);
}

// --- 9. START THE GAME ---
window.addEventListener('DOMContentLoaded', () => {
    drawMap();
    function loadImage(imgElement) { return new Promise(resolve => { if (imgElement.complete) { resolve(); } else { imgElement.onload = resolve; imgElement.onerror = resolve; } }); }
    Promise.all([ loadImage(dragonImg), loadImage(catImg), loadImage(robotImg) ]).then(() => { update(); });
});