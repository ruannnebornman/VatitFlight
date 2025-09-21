// Player logic and rendering
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
export const PLAYER_SPEED = 5;

export const player = {
    x: 0,
    y: 0,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0
};

export function updatePlayer(keys, canvas) {
    player.dx = 0;
    player.dy = 0;
    if (keys['arrowleft'] || keys['a']) player.dx = -PLAYER_SPEED;
    if (keys['arrowright'] || keys['d']) player.dx = PLAYER_SPEED;
    if (keys['arrowup'] || keys['w']) player.dy = -PLAYER_SPEED;
    if (keys['arrowdown'] || keys['s']) player.dy = PLAYER_SPEED;
    player.x += player.dx;
    player.y += player.dy;
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

export function drawPlayer(ctx, playerImg, shieldActive, shieldEndTime) {
    ctx.save();
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
