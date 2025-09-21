// Invoice (enemy) logic and rendering
export const INVOICE_WIDTH = 60;
export const INVOICE_HEIGHT = 60;
export let invoiceSpeed = 1.5;
export let lastSpeedIncreaseTime = Date.now();
export let invoiceSpawnTimer = 0;
export let invoiceSpawnInterval = 10;
export const invoices = [];

export function spawnInvoice(canvas) {
    const x = Math.random() * (canvas.width - INVOICE_WIDTH);
    // Random initial direction, evenly distributed between down-right and down-left (45deg to 135deg)
    const angle = Math.random() * (Math.PI / 2) + Math.PI / 4; // 45deg to 135deg
    invoices.push({
        x,
        y: -INVOICE_HEIGHT,
        width: INVOICE_WIDTH,
        height: INVOICE_HEIGHT,
        dx: Math.cos(angle) * invoiceSpeed,
        dy: Math.sin(angle) * invoiceSpeed, // always positive (down)
        directionTimer: Math.floor(Math.random() * 60) + 60 // 1-2 seconds
    });
}

export function updateInvoices(canvas, gameOver) {
    invoiceSpawnTimer++;
    // Cap max invoices to 100
    if (invoiceSpawnTimer >= invoiceSpawnInterval && !gameOver && invoices.length < 100) {
        spawnInvoice(canvas);
        invoiceSpawnTimer = 0;
    }
    for (let i = invoices.length - 1; i >= 0; i--) {
        const invoice = invoices[i];
        // Move invoice
        invoice.x += invoice.dx;
        invoice.y += invoice.dy;
        // Bounce off left/right edges
        if (invoice.x < 0) {
            invoice.x = 0;
            invoice.dx = Math.abs(invoice.dx);
        }
        if (invoice.x + invoice.width > canvas.width) {
            invoice.x = canvas.width - invoice.width;
            invoice.dx = -Math.abs(invoice.dx);
        }
        // Change direction after timer
        invoice.directionTimer--;
        if (invoice.directionTimer <= 0) {
            const angle = Math.random() * (Math.PI / 2) + Math.PI / 4; // 45deg to 135deg
            invoice.dx = Math.cos(angle) * invoiceSpeed;
            invoice.dy = Math.sin(angle) * invoiceSpeed;
            invoice.directionTimer = Math.floor(Math.random() * 60) + 60;
        }
        // Remove invoice if off bottom
        if (invoice.y > canvas.height + invoice.height) {
            invoices.splice(i, 1);
        }
    }
    // Half the speed increase, double the density increase
    if (Date.now() - lastSpeedIncreaseTime >= 1000) {
        invoiceSpeed *= 1.025;
        invoiceSpawnInterval = Math.max(1, Math.round(invoiceSpawnInterval / 2.1));
        lastSpeedIncreaseTime = Date.now();
    }
}

export function drawInvoices(ctx, invoiceImg) {
    invoices.forEach(invoice => {
        ctx.save();
        ctx.drawImage(
            invoiceImg,
            invoice.x,
            invoice.y,
            invoice.width / 2,
            invoice.height / 2
        );
        ctx.restore();
    });
}

export function resetInvoices() {
    invoiceSpeed = 1.5;
    invoiceSpawnInterval = 10;
    lastSpeedIncreaseTime = Date.now();
}
