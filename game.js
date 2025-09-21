// Import modules
import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, player, updatePlayer, drawPlayer } from './player.js';
import * as bugsModule from './bugs.js';
import { POWERUP_WIDTH, POWERUP_HEIGHT, POWERUP_SPEED, POWERUP_SPAWN_INTERVAL, powerupSpawnTimer, powerups, spawnPowerup, updatePowerups, drawPowerups } from './powerups.js';
import { BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED, bullets, shootBullet, updateBullets, drawBullets } from './bullets.js';
import { drawHearts, drawScore, explosions, EXPLOSION_DURATION, addExplosion, updateExplosions, drawExplosions } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let endTime = null;
let lives = 3;
const MAX_LIVES = 3;
let gameOver = false;
let shooting = false;
let lastShotTime = 0;
const SHOOT_INTERVAL = 75; // ms between shots, doubled fire rate

// Bullet line state
let bulletLineCount = 1;

// Shield state
let shieldActive = false;
let shieldEndTime = 0;
const SHIELD_DURATION_MS = 5 * 1000; // 5000 seconds in ms

// Score
let score = 0;

// Track time alive
let startTime = Date.now();

// Load images
const playerImg = new Image();
playerImg.src = 'icons/player.png';
const bugImg = new Image();
bugImg.src = 'icons/bug.png';
const powerupRedImg = new Image();
powerupRedImg.src = 'icons/powerupRed.png';
const powerupBlueImg = new Image();
powerupBlueImg.src = 'icons/powerupBlue.png';
const powerupGreenImg = new Image();
powerupGreenImg.src = 'icons/powerupGreen.png';

// Initialize game objects
resetGame();

function resetGame() {
    lives = MAX_LIVES;
    gameOver = false;
    bugsModule.bugs.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    powerups.length = 0;
    shieldActive = false;
    shieldEndTime = 0;
    score = 0;
    startTime = Date.now();
    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 10;
    // Reset bug speed and spawn interval using module function
    bugsModule.resetBugs();
    bulletLineCount = 1;
        endTime = null;
}

// Handle keyboard input
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
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

function checkCollisions() {
    if (gameOver) return;
    // Check bug-player collision
    for (let i = bugsModule.bugs.length - 1; i >= 0; i--) {
        const bug = bugsModule.bugs[i];
        if (
            bug.x < player.x + player.width &&
            bug.x + bug.width > player.x &&
            bug.y < player.y + player.height &&
            bug.y + bug.height > player.y
        ) {
            bugsModule.bugs.splice(i, 1);
            if (!(shieldActive && (Date.now() < shieldEndTime))) {
                lives--;
                if (lives <= 0) {
                    lives = 0;
                    gameOver = true;
                    endTime = Date.now();
                }
            }
        }
    }
    // Check bullet-bug collision
    for (let i = bugsModule.bugs.length - 1; i >= 0; i--) {
        const bug = bugsModule.bugs[i];
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
                bugsModule.bugs.splice(i, 1);
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
            if (p.type === 'green') {
                bulletLineCount++;
            }
            powerups.splice(i, 1);
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameOver) {
        updatePlayer(keys, canvas);
        updateBullets();
        bugsModule.updateBugs(canvas, gameOver);
        updatePowerups(canvas, gameOver);
        updateExplosions();
        checkCollisions();
        if (shooting && Date.now() - lastShotTime > SHOOT_INTERVAL) {
            shootBullet(player, bulletLineCount);
            lastShotTime = Date.now();
        }
    }
    drawPlayer(ctx, playerImg, shieldActive, shieldEndTime);
    drawBullets(ctx);
    bugsModule.drawBugs(ctx, bugImg);
    drawPowerups(ctx, powerupRedImg, powerupBlueImg, powerupGreenImg);
    drawExplosions(ctx);
    let secondsAlive;
        if (gameOver && endTime) {
            secondsAlive = Math.floor((endTime - startTime) / 1000);
        } else {
            secondsAlive = Math.floor((Date.now() - startTime) / 1000);
        }
    drawScore(ctx, score, secondsAlive);
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

gameLoop();
