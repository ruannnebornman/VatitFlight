// Import modules
import { PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED, player, updatePlayer, drawPlayer } from './player.js';
import * as invoicesModule from './invoices.js';
import { POWERUP_WIDTH, POWERUP_HEIGHT, POWERUP_SPEED, POWERUP_SPAWN_INTERVAL, powerupSpawnTimer, powerups, spawnPowerup, updatePowerups, drawPowerups } from './powerups.js';
import { BULLET_WIDTH, BULLET_HEIGHT, BULLET_SPEED, bullets, shootBullet, updateBullets, drawBullets } from './bullets.js';
import { drawHearts, drawScore, explosions, EXPLOSION_DURATION, addExplosion, updateExplosions, drawExplosions } from './ui.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
// Player name logic
function renderScoreboard() {
    let scores = [];
    // Try Node.js fs first
    if (typeof require === 'function') {
        try {
            const fs = require('fs');
            const path = 'scoreboard.json';
            if (fs.existsSync(path)) {
                scores = JSON.parse(fs.readFileSync(path, 'utf8'));
            }
        } catch (e) {
            console.error('Failed to load scores:', e);
        }
    } else {
        try {
            scores = JSON.parse(localStorage.getItem('vatitflight_scores') || '[]');
        } catch {}
    }
    const scoreboardDiv = document.getElementById('scoreboard');
    if (!scoreboardDiv) return;
    let html = '<h2>Scoreboard</h2>';
    if (scores.length === 0) {
        html += '<div>No scores yet!</div>';
    } else {
    scores.sort((a, b) => b.score - a.score);
    scores.slice(0, 7).forEach(entry => {
            html += `<div class="score-entry">
                <span class="score-name">${entry.name}</span><br>
                <span class="score-score">Score: ${entry.score}</span><br>
                <span class="score-time">Time: ${entry.time}s</span>
            </div>`;
        });
    }
    scoreboardDiv.innerHTML = html;
}
let playerName = null;
function getPlayerName() {
    playerName = localStorage.getItem('vatitflight_player_name');
    if (!playerName) {
        playerName = prompt('Enter your name for the scoreboard:');
        if (playerName) {
            localStorage.setItem('vatitflight_player_name', playerName);
        } else {
            playerName = 'Anonymous';
        }
    }
    return playerName;
}
let endTime = null;
let lives = 3;
const MAX_LIVES = 3;
let gameOver = false;
let shooting = false;
let lastShotTime = 0;
const BASE_SHOOT_INTERVAL = 75; // ms between shots

// Bullet line state
let bulletLineCount = 1;

// Shield state
let shieldActive = false;
let shieldEndTime = 0;
const SHIELD_DURATION_MS = 2 * 1000; // 2 seconds in ms

// Score
let score = 0;

// Track time alive
let startTime = Date.now();

// Load images
const playerImg = new Image();
playerImg.src = 'icons/player.png';
const invoiceImg = new Image();
invoiceImg.src = 'icons/invoice.png';
const powerupRedImg = new Image();
powerupRedImg.src = 'icons/powerupRed.png';
const powerupBlueImg = new Image();
powerupBlueImg.src = 'icons/powerupBlue.png';
const powerupGreenImg = new Image();
powerupGreenImg.src = 'icons/powerupGreen.png';

// Initialize game objects
getPlayerName();
resetGame();
renderScoreboard();

function resetGame() {
    lives = MAX_LIVES;
    gameOver = false;
    invoicesModule.invoices.length = 0;
    bullets.length = 0;
    explosions.length = 0;
    powerups.length = 0;
    shieldActive = false;
    shieldEndTime = 0;
    score = 0;
    startTime = Date.now();
    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 10;
    // Reset invoice speed and spawn interval using module function
    invoicesModule.resetInvoices();
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
    // Check invoice-player collision
    for (let i = invoicesModule.invoices.length - 1; i >= 0; i--) {
        const invoice = invoicesModule.invoices[i];
        if (
            invoice.x < player.x + player.width &&
            invoice.x + invoice.width > player.x &&
            invoice.y < player.y + player.height &&
            invoice.y + invoice.height > player.y
        ) {
            // Only trigger explosion and shield if not already shielded
            if (!shieldActive || Date.now() > shieldEndTime) {
                // Massive explosion and shield buff on damage
                const explosionRadius = 180;
                const px = player.x + player.width / 2;
                const py = player.y + player.height / 2;
                for (let j = invoicesModule.invoices.length - 1; j >= 0; j--) {
                    const invoice = invoicesModule.invoices[j];
                    const ix = invoice.x + invoice.width / 2;
                    const iy = invoice.y + invoice.height / 2;
                    const dist = Math.hypot(px - ix, py - iy);
                    if (dist < explosionRadius) {
                        addExplosion(ix, iy);
                        invoicesModule.invoices.splice(j, 1);
                    }
                }
                // Massive explosion at player
                addExplosion(px, py);
                // Grant shield buff
                shieldActive = true;
                shieldEndTime = Date.now() + SHIELD_DURATION_MS;
                // Lose life
                lives--;
                if (lives <= 0) {
                    lives = 0;
                    gameOver = true;
                    endTime = Date.now();
                }
            }
        }
    }
    // Check bullet-invoice collision
    for (let i = invoicesModule.invoices.length - 1; i >= 0; i--) {
        const invoice = invoicesModule.invoices[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (
                bullet.x < invoice.x + invoice.width &&
                bullet.x + bullet.width > invoice.x &&
                bullet.y < invoice.y + invoice.height &&
                bullet.y + bullet.height > invoice.y
            ) {
                // Explosion at invoice center
                addExplosion(invoice.x + invoice.width / 2, invoice.y + invoice.height / 2);
                invoicesModule.invoices.splice(i, 1);
                bullets.splice(j, 1);
                score += 1;
                break;
            }
        }
    }
    // Check player-powerup collision
    for (let i = powerups.length - 1; i >= 0; i--) {
        const p = powerups[i];
        if (
            p.x < player.x + player.width &&
            p.x + p.width * 4 > player.x &&
            p.y < player.y + player.height &&
            p.y + p.height * 4 > player.y
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
            // Add inverse color explosion at powerup center
            addExplosion(p.x + p.width, p.y + p.height, 'inverse');
            powerups.splice(i, 1);
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!gameOver) {
        updatePlayer(keys, canvas);
        updateBullets();
        invoicesModule.updateInvoices(canvas, gameOver);
        updatePowerups(canvas, gameOver);
        updateExplosions();
        checkCollisions();
    // Fire rate slows by 20% per upgrade
    const upgradeCount = bulletLineCount - 1;
    const shootInterval = Math.round(BASE_SHOOT_INTERVAL * Math.pow(1.20, upgradeCount));
        if (shooting && Date.now() - lastShotTime > shootInterval) {
            shootBullet(player, bulletLineCount);
            lastShotTime = Date.now();
        }
    }
    drawPlayer(ctx, playerImg, shieldActive, shieldEndTime);
    drawBullets(ctx);
    invoicesModule.drawInvoices(ctx, invoiceImg);
    drawPowerups(ctx, powerupRedImg, powerupBlueImg, powerupGreenImg);
    drawExplosions(ctx);
    let secondsAlive;
    if (gameOver && endTime) {
        secondsAlive = Math.floor((endTime - startTime) / 1000);
        // Save score to scoreboard.json if not already saved for this game over
        if (!window._scoreSaved) {
            window._scoreSaved = true;
            saveScore(playerName, score, secondsAlive);
        }
    } else {
        secondsAlive = Math.floor((Date.now() - startTime) / 1000);
        window._scoreSaved = false;
    }
    drawHearts(ctx, lives, shieldActive, shieldEndTime, canvas);
    drawScore(ctx, score, secondsAlive);

// Save score to scoreboard.json
function saveScore(name, score, time) {
    // Try to use Node.js fs if available (for local dev)
    function insertScore(scores, entry) {
        scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 5) scores.length = 5;
        return scores;
    }
    if (typeof require === 'function') {
        try {
            const fs = require('fs');
            const path = 'scoreboard.json';
            let scores = [];
            if (fs.existsSync(path)) {
                scores = JSON.parse(fs.readFileSync(path, 'utf8'));
            }
            // Only save if score is high enough
            if (scores.length < 5 || score > (scores[4]?.score ?? -Infinity)) {
                scores = insertScore(scores, { name, score, time, date: new Date().toISOString() });
            }
            // Always keep only top 5
            scores.sort((a, b) => b.score - a.score);
            if (scores.length > 5) scores.length = 5;
            fs.writeFileSync(path, JSON.stringify(scores, null, 2));
        } catch (e) {
            console.error('Failed to save score:', e);
        }
    } else {
        // Fallback: save to localStorage
        let scores = [];
        try {
            scores = JSON.parse(localStorage.getItem('vatitflight_scores') || '[]');
        } catch {}
        if (scores.length < 5 || score > (scores[4]?.score ?? -Infinity)) {
            scores = insertScore(scores, { name, score, time, date: new Date().toISOString() });
        }
        // Always keep only top 5
    scores.sort((a, b) => b.score - a.score);
    if (scores.length > 7) scores.length = 7;
        localStorage.setItem('vatitflight_scores', JSON.stringify(scores));
    }
    renderScoreboard();
}
    if (gameOver) {
        ctx.save();
        ctx.font = 'bold 48px Orbitron, Arial, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
        ctx.font = 'bold 24px Orbitron, Arial, sans-serif';
        ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 50);
        ctx.restore();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();
