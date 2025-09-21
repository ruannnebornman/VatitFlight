// UI and effects logic
export function drawHearts(ctx, lives, shieldActive, shieldEndTime, canvas) {
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

export function drawScore(ctx, score, secondsAlive) {
    ctx.save();
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    // Draw less transparent black background rectangle, wider for long scores
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(10, 10, 400, 40);
    // Draw score and seconds on the same line
    ctx.fillStyle = '#fff';
    let scoreText = 'Score: ' + score;
    let timeText = ' | Time: ' + secondsAlive + 's';
    ctx.fillText(scoreText + timeText, 20, 38);
    ctx.restore();
}

export const explosions = [];
export const EXPLOSION_DURATION = 20;

export function addExplosion(x, y) {
    explosions.push({ x, y, frame: 0 });
}

export function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].frame++;
        if (explosions[i].frame > EXPLOSION_DURATION) {
            explosions.splice(i, 1);
        }
    }
}

export function drawExplosions(ctx) {
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
