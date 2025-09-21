// Powerup logic and rendering
export const POWERUP_WIDTH = 40;
export const POWERUP_HEIGHT = 40;
export const POWERUP_SPEED = 2;
export const POWERUP_SPAWN_INTERVAL = 300;
export let powerupSpawnTimer = 0;
export const powerups = [];

export function spawnPowerup(canvas) {
    const fromLeft = Math.random() < 0.5;
    const types = ['red', 'blue', 'green'];
    const type = types[Math.floor(Math.random() * types.length)];
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

export function updatePowerups(canvas, gameOver) {
    powerupSpawnTimer++;
    if (powerupSpawnTimer >= POWERUP_SPAWN_INTERVAL && !gameOver) {
        spawnPowerup(canvas);
        powerupSpawnTimer = 0;
    }
    for (let i = powerups.length - 1; i >= 0; i--) {
        powerups[i].x += powerups[i].dx;
        if (powerups[i].x < -POWERUP_WIDTH || powerups[i].x > canvas.width + POWERUP_WIDTH) {
            powerups.splice(i, 1);
        }
    }
}

export function drawPowerups(ctx, powerupRedImg, powerupBlueImg, powerupGreenImg) {
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
