// Bullet logic and rendering
export const BULLET_WIDTH = 6;
export const BULLET_HEIGHT = 16;
export const BULLET_SPEED = 8;
export const bullets = [];

export function shootBullet(player) {
    let lines = 1;
    let spread = 40; // total spread in px
    if (arguments.length > 1) {
        lines = arguments[1];
    }
    if (lines === 1) {
        bullets.push({
            x: player.x + player.width / 2 - BULLET_WIDTH / 2,
            y: player.y,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT
        });
    } else {
        for (let i = 0; i < lines; i++) {
            // Centered spread
            let offset = ((i - (lines - 1) / 2) * (spread / Math.max(lines - 1, 1)));
            bullets.push({
                x: player.x + player.width / 2 - BULLET_WIDTH / 2 + offset,
                y: player.y,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT
            });
        }
    }
}

export function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= BULLET_SPEED;
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
        }
    }
}

export function drawBullets(ctx) {
    ctx.fillStyle = '#ff0';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}
