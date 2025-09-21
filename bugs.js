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
    // Random initial direction, evenly distributed between down-right and down-left (45deg to 135deg)
    const angle = Math.random() * (Math.PI / 2) + Math.PI / 4; // 45deg to 135deg
    bugs.push({
        x,
        y: -BUG_HEIGHT,
        width: BUG_WIDTH,
        height: BUG_HEIGHT,
        dx: Math.cos(angle) * bugSpeed,
        dy: Math.sin(angle) * bugSpeed, // always positive (down)
        directionTimer: Math.floor(Math.random() * 60) + 60 // 1-2 seconds
    });
}

export function updateBugs(canvas, gameOver) {
    bugSpawnTimer++;
    if (bugSpawnTimer >= bugSpawnInterval && !gameOver) {
        spawnBug(canvas);
        bugSpawnTimer = 0;
    }
    for (let i = bugs.length - 1; i >= 0; i--) {
        const bug = bugs[i];
        // Move bug
        bug.x += bug.dx;
        bug.y += bug.dy;
        // Bounce off left/right edges
        if (bug.x < 0) {
            bug.x = 0;
            bug.dx = Math.abs(bug.dx);
        }
        if (bug.x + bug.width > canvas.width) {
            bug.x = canvas.width - bug.width;
            bug.dx = -Math.abs(bug.dx);
        }
        // Change direction after timer
        bug.directionTimer--;
        if (bug.directionTimer <= 0) {
            const angle = Math.random() * (Math.PI / 2) + Math.PI / 4; // 45deg to 135deg
            bug.dx = Math.cos(angle) * bugSpeed;
            bug.dy = Math.sin(angle) * bugSpeed;
            bug.directionTimer = Math.floor(Math.random() * 60) + 60;
        }
        // Remove bug if off bottom
        if (bug.y > canvas.height + bug.height) {
            bugs.splice(i, 1);
        }
    }
    // Half the speed increase, double the density increase
    if (Date.now() - lastSpeedIncreaseTime >= 1000) {
        bugSpeed *= 1.025; // Half the previous 5% increase
        bugSpawnInterval = Math.max(1, Math.round(bugSpawnInterval / 2.1)); // Double the density increase
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

export function resetBugs() {
    bugSpeed = 1.5;
    bugSpawnInterval = 10;
    lastSpeedIncreaseTime = Date.now();
}
