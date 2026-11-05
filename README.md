# Duels (Remastered) — Online multiplayer server

This is a Node.js WebSocket server with the game served from the same origin.

## Run locally

1. Install Node.js 18+.
2. In this folder run `npm install` and `npm start`.
3. Open `http://localhost:3000` in a browser.
4. For friends on other networks, deploy this **whole folder** to a Node.js hosting provider that supports WebSockets (e.g. Render Web Service). Build command: `npm install`; start command: `npm start`.
5. Both players open the same deployed HTTPS URL. Host selects **Game Modes → Online Multiplayer → Create Online Party**, shares the six-digit code. Friend selects Join and enters it. Host starts the match.

The server keeps temporary 2-player rooms in memory. Room codes expire when a player disconnects or the server restarts. The host simulates the match and streams state to the guest. This is an early online implementation: latency may affect responsiveness; it is not cheat-resistant or production-hardened. Saved coins, skins, and unlocks remain browser-local, not shared across devices. No publicly hosted server is included.
