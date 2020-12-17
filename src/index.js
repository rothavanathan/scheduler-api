const PORT = process.env.PORT || 8001;
const ENV = require("./environment");

const app = require("./application")(ENV, { updateAppointment });
const server = require("http").Server(app);

const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

wss.on("connection", socket => {
  socket.onmessage = event => {
    console.log(`Message Received: ${event.data}`);

    if (event.data === "ping") {
      socket.send(JSON.stringify("pong"));
    }
    
  };

  socket.addEventListener("close", () => {
    console.log(`socket closed.`);
  });
});

function updateAppointment(id, interview, changeSpots = false, type = "CANCEL_INTERVIEW") {
  wss.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({        
          id,
          interview,
          changeSpots,
          type
        })
      );
    }
  });
}

function cancelAppointment(id) {
  wss.clients.forEach(function eachClient(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          id,
          interview: null,
          changeSpots: true,
          type: "CANCEL_INTERVIEW"
        })
      );
    }
  });
}

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT} in ${ENV} mode.`);
});
