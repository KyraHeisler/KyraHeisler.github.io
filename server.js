// Install first: npm install express socket.io
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let players = {};

io.on("connection", (socket) => {
    console.log("A player connected:", socket.id);

    // Add player
    players[socket.id] = {
        x: 400,
        y: 300,
        name: "Player-" + socket.id.substring(0, 4),
        color: "#" + Math.floor(Math.random() * 16777215).toString(16)
    };

    // Send all players to new connection
    socket.emit("currentPlayers", players);

    // Notify others of new player
    socket.broadcast.emit("newPlayer", players[socket.id]);

    // Movement handler
    socket.on("move", (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            io.emit("playerMoved", players[socket.id]);
        }
    });

    // Remove player when disconnected
    socket.on("disconnect", () => {
        console.log("Player disconnected:", socket.id);
        delete players[socket.id];
        io.emit("playerDisconnected", socket.id);
    });
});

http.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
