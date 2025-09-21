// Bullet logic and rendering
export const BULLET_WIDTH = 6;
export const BULLET_HEIGHT = 16;
export const BULLET_SPEED = 8;
export const bullets = [];

export function shootBullet(player) {
    let upgrades = 0;
    if (arguments.length > 1) {
        upgrades = arguments[1] - 1;
    }
    const px = player.x + player.width / 2 - BULLET_WIDTH / 2;
    const py = player.y;
    // Helper to add a bullet with angle
    function addBullet(angleDeg) {
        const angleRad = angleDeg * Math.PI / 180;
        bullets.push({
            x: px,
            y: py,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            vx: BULLET_SPEED * Math.sin(angleRad),
            vy: -BULLET_SPEED * Math.cos(angleRad)
        });
    }
    // Base: 1 bullet straight up
    addBullet(0);
    // For each upgrade, add a bullet at ±(15 * n)°
    for (let n = 1; n <= upgrades; n++) {
        addBullet(-15 * n);
        addBullet(15 * n);
    }
}

export function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        // If vx/vy exist, use them for movement, else default to straight up
        if (typeof bullets[i].vx === 'number' && typeof bullets[i].vy === 'number') {
            bullets[i].x += bullets[i].vx;
            bullets[i].y += bullets[i].vy;
        } else {
            bullets[i].y -= BULLET_SPEED;
        }
        if (bullets[i].y + bullets[i].height < 0 || bullets[i].x < -BULLET_WIDTH || bullets[i].x > 10000) {
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
