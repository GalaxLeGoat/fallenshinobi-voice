// ============================================
// FallenShinobi-Voice — Serveur
// ============================================
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Sert les fichiers de l'app (index.html, map.png)
app.use(express.static(path.join(__dirname, "client")));

// Stockage des joueurs connectés
const players = {};

io.on("connection", (socket) => {
  console.log(`[+] Joueur connecté : ${socket.id}`);

  // Joueur rejoint avec son nom + village + position
  socket.on("join", (data) => {
    players[socket.id] = {
      id: socket.id,
      name: data.name,
      village: data.village,
      x: data.x,
      y: data.y,
    };
    // Envoyer la liste des joueurs existants au nouveau
    socket.emit("players", players);
    // Annoncer le nouveau joueur aux autres
    socket.broadcast.emit("player_joined", players[socket.id]);
    console.log(`[JOIN] ${data.name} (${data.village})`);
  });

  // Mise à jour de position
  socket.on("move", (data) => {
    if (!players[socket.id]) return;
    players[socket.id].x = data.x;
    players[socket.id].y = data.y;
    // Envoyer la nouvelle position aux autres
    socket.broadcast.emit("player_moved", {
      id: socket.id,
      x: data.x,
      y: data.y,
    });
  });

  // WebRTC signaling — offre de connexion vocale
  socket.on("voice_offer", (data) => {
    io.to(data.to).emit("voice_offer", {
      from: socket.id,
      offer: data.offer,
    });
  });

  // WebRTC signaling — réponse
  socket.on("voice_answer", (data) => {
    io.to(data.to).emit("voice_answer", {
      from: socket.id,
      answer: data.answer,
    });
  });

  // WebRTC signaling — ICE candidate
  socket.on("ice_candidate", (data) => {
    io.to(data.to).emit("ice_candidate", {
      from: socket.id,
      candidate: data.candidate,
    });
  });

  // Déconnexion
  socket.on("disconnect", () => {
    if (players[socket.id]) {
      console.log(`[-] ${players[socket.id].name} déconnecté`);
      socket.broadcast.emit("player_left", socket.id);
      delete players[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Serveur FallenShinobi-Voice lancé sur http://localhost:${PORT}`);
});
