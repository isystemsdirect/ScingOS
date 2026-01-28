const WebSocket = require("ws");

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787;
const wss = new WebSocket.Server({ port });

console.log(`ScingR link-server listening on ws://127.0.0.1:${port}`);

const states = ["IDLE", "LISTENING", "THINKING", "SPEAKING", "IDLE", "THINKING"];
let idx = 0;

function randIntensity(base) {
  // bounded, repetitive randomness
  const jitter = (Math.sin(Date.now() / 1800) + 1) * 0.5; // 0..1
  const v = base + (jitter - 0.5) * 0.18; // +/-0.09
  return Math.max(0, Math.min(1, v));
}

wss.on("connection", (socket) => {
  console.log("Client connected.");

  socket.send(JSON.stringify({ type: "status", state: "linked", ts: Date.now() }));

  const timer = setInterval(() => {
    socket.send(JSON.stringify({ type: "heartbeat", ts: Date.now() }));
  }, 1500);

  const srtTicker = setInterval(() => {
    const st = states[idx % states.length];
    const base =
      st === "IDLE"
        ? 0.45
        : st === "LISTENING"
          ? 0.62
          : st === "THINKING"
            ? 0.78
            : st === "SPEAKING"
              ? 0.70
              : 0.55;
    const intensity = randIntensity(base);
    socket.send(
      JSON.stringify({
        type: "srt",
        state: st,
        intensity,
        source: "link-server",
        ts: Date.now(),
      })
    );
    idx++;
  }, 2600);

  socket.on("message", (msg) => {
    console.log("RX:", msg.toString());
    socket.send(JSON.stringify({ type: "echo", data: msg.toString(), ts: Date.now() }));
  });

  socket.on("close", () => {
    clearInterval(timer);
    clearInterval(srtTicker);
    console.log("Client disconnected.");
  });
});
