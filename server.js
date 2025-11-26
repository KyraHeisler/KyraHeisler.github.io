const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080 });

let players = {};

server.on("connection", ws => {
    const id = Date.now().toString();
    players[id] = { x: 0, y: 1, z: 0 };

    ws.send(JSON.stringify({ type: "init", id, players }));

    ws.on("message", msg => {
        const data = JSON.parse(msg);

        if (data.type === "move") {
            players[id] = data.position;

            broadcast(JSON.stringify({
                type: "playerMove",
                id,
                position: data.position
            }));
        }
    });

    ws.on("close", () => {
        delete players[id];
        broadcast(JSON.stringify({ type: "playerLeft", id }));
    });
});

function broadcast(msg) {
    server.clients.forEach(client => client.send(msg));
}

console.log("Server running at ws://localhost:8080");
