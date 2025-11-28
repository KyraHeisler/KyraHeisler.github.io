const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname));

let players = {};

io.on("connection", (socket) => {
    players[socket.id] = {
        id: socket.id,
        x: 400,
        y: 300,
        name: "Player-" + socket.id.slice(0, 4),
        color: "#" + Math.floor(Math.random() * 16777215).toString(16)
    };

    socket.emit("currentPlayers", players);
    socket.broadcast.emit("newPlayer", players[socket.id]);

    socket.on("move", (data) => {
        let p = players[socket.id];
        if (p) {
            p.x = data.x;
            p.y = data.y;
            io.emit("playerMoved", p);
        }
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("playerDisconnected", socket.id);
    });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
