const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Game constants
// ...existing code...
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 40;
const PLAYER_SPEED = 5;

// Player object
const player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0
};

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    // Spacebar shoots or resets game
    if (e.code === 'Space') {
        if (gameOver) {
            resetGame();
        } else {
            shooting = true;
        }
    }
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
    if (e.code === 'Space') {
        shooting = false;
    }
});

function updatePlayer() {
    player.dx = 0;
    player.dy = 0;
    // Horizontal movement
    if (keys['arrowleft'] || keys['a']) player.dx = -PLAYER_SPEED;
    if (keys['arrowright'] || keys['d']) player.dx = PLAYER_SPEED;
    // Vertical movement
    if (keys['arrowup'] || keys['w']) player.dy = -PLAYER_SPEED;
    if (keys['arrowdown'] || keys['s']) player.dy = PLAYER_SPEED;
    player.x += player.dx;
    player.y += player.dy;
    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

// Bullet mechanics
const bullets = [];
const BULLET_WIDTH = 6;
const BULLET_HEIGHT = 16;
const BULLET_SPEED = 8;

function shootBullet() {
    // Bullet spawns from center top of player
    bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT
    });
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;
        // Remove bullet if it goes off screen
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    ctx.fillStyle = '#ff0';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Load player image
const playerImg = new Image();
playerImg.src = 'icons/player.png';

function drawPlayer() {
    ctx.save();
    // Draw shield circle if active and timer > 0
    if (shieldActive && (Date.now() < shieldEndTime)) {
        ctx.beginPath();
        ctx.arc(
            player.x + player.width / 2,
            player.y + player.height / 2,
            player.width / 2 + 10,
            0,
            Math.PI * 2
        );
        ctx.strokeStyle = '#00f';
        ctx.lineWidth = 5;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
    ctx.drawImage(
        playerImg,
        player.x,
        player.y,
        player.width,
        player.height
    );
    ctx.restore();
}

// Player lives
let lives = 3;
const MAX_LIVES = 3;
let gameOver = false;

// Enemy (bug) mechanics
const bugs = [];
const BUG_WIDTH = 60;
const BUG_HEIGHT = 60;
let bugSpeed = 1.5; // Lowered initial speed by half
let lastSpeedIncreaseTime = Date.now();
let bugSpawnTimer = 0;
let bugSpawnInterval = 10; // Doubled density (was 20)

// Load bug image
const bugImg = new Image();
bugImg.src = 'icons/bug.png';

// Powerup mechanics
const powerups = [];
const POWERUP_WIDTH = 40;
const POWERUP_HEIGHT = 40;
const POWERUP_SPEED = 2; // Lowered speed by half
const POWERUP_SPAWN_INTERVAL = 300; // 5 seconds at 60fps
let powerupSpawnTimer = 0;

// Load powerup images
const powerupRedImg = new Image();
powerupRedImg.src = 'icons/powerupRed.png';
const powerupBlueImg = new Image();
powerupBlueImg.src = 'icons/powerupBlue.png';
const powerupGreenImg = new Image();
powerupGreenImg.src = 'icons/powerupGreen.png';

// Score
let score = 0;

// Explosion effect
const explosions = [];
const EXPLOSION_DURATION = 20; // frames

function drawHearts() {
    for (let i = 0; i < lives; i++) {
        const x = canvas.width - 30 - i * 40;
        const y = 20;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.bezierCurveTo(x, y, x - 10, y - 10, x - 20, y);
        ctx.bezierCurveTo(x - 30, y + 10, x, y + 30, x, y + 20);
        ctx.bezierCurveTo(x, y + 30, x + 30, y + 10, x + 20, y);
        ctx.bezierCurveTo(x + 10, y - 10, x, y, x, y);
        ctx.fillStyle = (shieldActive && (Date.now() < shieldEndTime)) ? '#00f' : '#f00';
        ctx.fill();
        ctx.restore();
    }
    // Draw shield timer below hearts if active
    if (shieldActive && (Date.now() < shieldEndTime)) {
        const secondsLeft = Math.ceil((shieldEndTime - Date.now()) / 1000);
        ctx.save();
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#00f';
        ctx.textAlign = 'right';
        ctx.fillText('Shield: ' + secondsLeft + 's', canvas.width - 30, 65);
        ctx.restore();
    }
}

function spawnBug() {
    const x = Math.random() * (canvas.width - BUG_WIDTH);
    bugs.push({
        x,
        y: -BUG_HEIGHT,
        width: BUG_WIDTH,
        height: BUG_HEIGHT
    });
}

function updateBugs() {
    bugSpawnTimer++;
    if (bugSpawnTimer >= bugSpawnInterval && !gameOver) {
        spawnBug();
        bugSpawnTimer = 0;
    }
    for (let i = bugs.length - 1; i >= 0; i--) {
        bugs[i].y += bugSpeed;
        // Remove bug if off screen
        if (bugs[i].y > canvas.height) {
            bugs.splice(i, 1);
        }
    }
    // Increase bug speed by 5% every second and adjust spawn rate
    if (Date.now() - lastSpeedIncreaseTime >= 1000) {
        bugSpeed *= 1.05;
        bugSpawnInterval = Math.max(1, Math.round(bugSpawnInterval / 1.05));
        lastSpeedIncreaseTime = Date.now();
    }
}

function spawnPowerup() {
    // Randomly choose left or right
    const fromLeft = Math.random() < 0.5;
    // Randomly choose powerup type
    const types = ['red', 'blue', 'green'];
    const type = types[Math.floor(Math.random() * types.length)];
    // Only spawn in bottom half of screen
    const minY = canvas.height / 2;
    const maxY = canvas.height - POWERUP_HEIGHT - 50;
    powerups.push({
        x: fromLeft ? -POWERUP_WIDTH : canvas.width,
        y: Math.random() * (maxY - minY) + minY,
        width: POWERUP_WIDTH,
        height: POWERUP_HEIGHT,
        dx: fromLeft ? POWERUP_SPEED : -POWERUP_SPEED,
        type
    });
}

function updatePowerups() {
    powerupSpawnTimer++;
    if (powerupSpawnTimer >= POWERUP_SPAWN_INTERVAL && !gameOver) {
        spawnPowerup();
        powerupSpawnTimer = 0;
    }
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].x += powerups[i].dx;
        // Remove powerup if off screen
        if (powerups[i].x < -POWERUP_WIDTH || powerups[i].x > canvas.width + POWERUP_WIDTH) {
            powerups.splice(i, 1);
        }
    }
}

function drawPowerups() {
    powerups.forEach(powerup => {
        let img;
        if (powerup.type === 'red') img = powerupRedImg;
        else if (powerup.type === 'blue') img = powerupBlueImg;
        else if (powerup.type === 'green') img = powerupGreenImg;
        if (img) {
            ctx.save();
            ctx.drawImage(img, powerup.x, powerup.y, powerup.width, powerup.height);
            ctx.restore();
        }
    });
}

function drawBugs() {
    bugs.forEach(bug => {
        ctx.save();
        ctx.drawImage(
            bugImg,
            bug.x,
            bug.y,
            bug.width,
            bug.height
        );
        ctx.restore();
    });
}

function drawScore() {
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 20, 40);
    ctx.restore();
}

function addExplosion(x, y) {
    explosions.push({ x, y, frame: 0 });
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frame++;
        if (explosions[i].frame > EXPLOSION_DURATION) {
            explosions.splice(i, 1);
        }
    }
    // Update shield state
    if (shieldActive && (Date.now() >= shieldEndTime)) {
        shieldActive = false;
    }
}

function drawExplosions() {
    explosions.forEach(explosion => {
        ctx.save();
        ctx.globalAlpha = 1 - explosion.frame / EXPLOSION_DURATION;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, 20 * (1 - explosion.frame / EXPLOSION_DURATION), 0, Math.PI * 2);
        ctx.fillStyle = '#ff0';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, 10 * (1 - explosion.frame / EXPLOSION_DURATION), 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.restore();
    });
}

function checkCollisions() {
    if (gameOver) return;
    // Check bug-player collision
    for (let i = bugs.length - 1; i >= 0; i--) {
        const bug = bugs[i];
        if (
            bug.x < player.x + player.width &&
            bug.x + bug.width > player.x &&
            bug.y < player.y + player.height &&
            bug.y + bug.height > player.y
        ) {
            bugs.splice(i, 1);
            if (!(shieldActive && (Date.now() < shieldEndTime))) {
                lives--;
                if (lives <= 0) {
                    lives = 0;
                    gameOver = true;
                }
            }
        }
    }
    // Check bullet-bug collision
    for (let i = bugs.length - 1; i >= 0; i--) {
        const bug = bugs[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (
                bullet.x < bug.x + bug.width &&
                bullet.x + bullet.width > bug.x &&
                bullet.y < bug.y + bug.height &&
                bullet.y + bullet.height > bug.y
            ) {
                // Explosion at bug center
                addExplosion(bug.x + bug.width / 2, bug.y + bug.height / 2);
                bugs.splice(i, 1);
                bullets.splice(j, 1);
                score += 100;
                break;
            }
        }
    }
    // Check player-powerup collision
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (
            p.x < player.x + player.width &&
            p.x + p.width > player.x &&
            p.y < player.y + player.height &&
            p.y + p.height > player.y
        ) {
            // Apply powerup effects
            if (p.type === 'red' && lives < MAX_LIVES) {
                lives++;
            }
            if (p.type === 'blue') {
                shieldActive = true;
                shieldEndTime = Date.now() + SHIELD_DURATION_MS;
            }
            powerups.splice(i, 1);
        }
    }
}

function resetGame() {
    lives = MAX_LIVES;
    gameOver = false;
    bugs.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    powerups.length = 0;
    shieldActive = false;
    shieldEndTime = 0;
    score = 0;
    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 10;
}

let shooting = false;
let lastShotTime = 0;
const SHOOT_INTERVAL = 150; // ms between shots

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameOver) {
        updatePlayer();
        updateBullets();
        updateBugs();
        updatePowerups();
        updateExplosions();
        checkCollisions();
        // Handle shooting if spacebar is held
        if (shooting && Date.now() - lastShotTime > SHOOT_INTERVAL) {
            shootBullet();
            lastShotTime = Date.now();
        }
    }
    drawPlayer();
    drawBullets();
    drawBugs();
    drawPowerups();
    drawExplosions();
    drawHearts();
    drawScore();
    if (gameOver) {
        ctx.save();
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = 'bold 24px Arial';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
        ctx.restore();
    }
    requestAnimationFrame(gameLoop);
}

// Shield state
let shieldActive = false;
let shieldEndTime = 0;
const SHIELD_DURATION_MS = 5 * 1000; // 10000 seconds in ms

gameLoop();
