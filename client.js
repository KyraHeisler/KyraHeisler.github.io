const socket = io();

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let players = {};
let myId = "";
let speed = 4;

// Receive current players on join
socket.on("currentPlayers", (data) => {
    players = data;
    myId = socket.id;
});

// New player joins
socket.on("newPlayer", (player) => {
    players[player.id] = player;
});

// Player left
socket.on("playerDisconnected", (id) => {
    delete players[id];
});

// Player moved
socket.on("playerMoved", (player) => {
    players[player.id] = player;
});

let keys = {};
document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function drawReginaMap() {
    // Wascana Lake
    ctx.fillStyle = "#6ec6ff";
    ctx.fillRect(200, 150, 500, 250);

    // Legislature Building (simple rectangle)
    ctx.fillStyle = "#d4c39a";
    ctx.fillRect(380, 200, 140, 60);

    // Downtown grid blocks
    ctx.fillStyle = "#bdbdbd";
    ctx.fillRect(100, 50, 100, 100);
    ctx.fillRect(250, 50, 100, 100);
    ctx.fillRect(400, 50, 100, 100);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawReginaMap();

    // Move local player
    let me = players[myId];
    if (me) {
        if (keys["ArrowUp"] || keys["w"]) me.y -= speed;
        if (keys["ArrowDown"] || keys["s"]) me.y += speed;
        if (keys["ArrowLeft"] || keys["a"]) me.x -= speed;
        if (keys["ArrowRight"] || keys["d"]) me.x += speed;

        // Send movement to server
        socket.emit("move", { x: me.x, y: me.y });
    }

    // Draw players
    for (let id in players) {
        let p = players[id];
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.fillText(p.name, p.x - 15, p.y - 15);
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
