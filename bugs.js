// Bug (enemy) logic and rendering
export const BUG_WIDTH = 60;
export const BUG_HEIGHT = 60;
export let bugSpeed = 1.5;
export let lastSpeedIncreaseTime = Date.now();
export let bugSpawnTimer = 0;
export let bugSpawnInterval = 10;
export const bugs = [];

export function spawnBug(canvas) {
    const x = Math.random() * (canvas.width - BUG_WIDTH);
    bugs.push({
        x,
        y: -BUG_HEIGHT,
        width: BUG_WIDTH,
        height: BUG_HEIGHT
    });
}

export function updateBugs(canvas, gameOver) {
    bugSpawnTimer++;
    if (bugSpawnTimer >= bugSpawnInterval && !gameOver) {
        spawnBug(canvas);
        bugSpawnTimer = 0;
    }
    for (let i = bugs.length - 1; i >= 0; i--) {
        bugs[i].y += bugSpeed;
        if (bugs[i].y > canvas.height) {
            bugs.splice(i, 1);
        }
    }
    if (Date.now() - lastSpeedIncreaseTime >= 1000) {
        bugSpeed *= 1.05;
        bugSpawnInterval = Math.max(1, Math.round(bugSpawnInterval / 1.05));
        lastSpeedIncreaseTime = Date.now();
    }
}

export function drawBugs(ctx, bugImg) {
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
