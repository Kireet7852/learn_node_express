import type { Request, Response } from "express";

export function getWsDemo(_req: Request, res: Response): void {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Socket.IO Authenticated WebSocket Playground</title>
  <script src="/socket.io/socket.io.js"></script>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-border: #334155;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-hover: #0284c7;
      --success: #10b981;
      --danger: #ef4444;
      --warning: #f59e0b;
      --code-bg: #090d16;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; min-height: 100vh; }
    .container { max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
    header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--card-border); padding-bottom: 16px; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px; }
    .badge { padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .badge-disconnected { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid #ef4444; }
    .badge-connected { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #10b981; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); }
    .card h2 { font-size: 1.1rem; margin-bottom: 14px; font-weight: 600; color: #e2e8f0; display: flex; align-items: center; gap: 8px; }
    label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; }
    input, select { width: 100%; padding: 10px 12px; background: var(--code-bg); border: 1px solid var(--card-border); border-radius: 6px; color: var(--text); font-size: 0.9rem; margin-bottom: 12px; outline: none; }
    input:focus { border-color: var(--primary); }
    .row { display: flex; gap: 10px; align-items: center; }
    button { cursor: pointer; padding: 9px 16px; border-radius: 6px; border: none; font-weight: 600; font-size: 0.85rem; transition: background 0.15s ease; background: var(--primary); color: #000; }
    button:hover { background: var(--primary-hover); color: #fff; }
    button.btn-danger { background: var(--danger); color: #fff; }
    button.btn-danger:hover { background: #dc2626; }
    button.btn-secondary { background: #475569; color: #fff; }
    button.btn-secondary:hover { background: #334155; }
    .log-box { background: var(--code-bg); border: 1px solid var(--card-border); border-radius: 8px; height: 320px; overflow-y: auto; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.8rem; display: flex; flex-direction: column; gap: 6px; }
    .log-entry { line-height: 1.4; padding: 4px 8px; border-radius: 4px; background: rgba(255,255,255,0.03); }
    .log-time { color: var(--text-muted); margin-right: 8px; }
    .log-tag { font-weight: bold; margin-right: 6px; }
    .tag-echo { color: #38bdf8; }
    .tag-broadcast { color: #a855f7; }
    .tag-room { color: #34d399; }
    .tag-system { color: #fbbf24; }
    .tag-error { color: #f87171; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>⚡ Socket.IO Dual-Auth WebSocket</h1>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">Supports both Stateless JWT Bearer & Stateful Session ID authentication</p>
      </div>
      <span id="connectionBadge" class="badge badge-disconnected">Disconnected</span>
    </header>

    <div class="grid">
      <!-- Connection & Auth -->
      <div class="card">
        <h2>🔑 Handshake Authentication</h2>
        <label for="authType">Auth Method</label>
        <select id="authType" onchange="toggleAuthFields()">
          <option value="jwt">Stateless JWT Token</option>
          <option value="session">Stateful Session ID</option>
        </select>

        <div id="jwtGroup">
          <label for="tokenInput">JWT Token (Bearer)</label>
          <input type="text" id="tokenInput" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
        </div>

        <div id="sessionGroup" style="display: none;">
          <label for="sessionIdInput">Session ID</label>
          <input type="text" id="sessionIdInput" placeholder="64-hex char session ID or cookie 'sid'">
        </div>

        <div class="row">
          <button id="connectBtn" onclick="connectSocket()">Connect</button>
          <button id="disconnectBtn" class="btn-danger" onclick="disconnectSocket()" disabled>Disconnect</button>
        </div>
      </div>

      <!-- Quick Actions: Echo & Broadcast -->
      <div class="card">
        <h2>📡 Echo & Global Broadcast</h2>
        <label for="messageInput">Message Payload</label>
        <input type="text" id="messageInput" placeholder="Type a message..." value="Hello from WebSocket client!">
        <div class="row">
          <button onclick="sendEcho()" id="echoBtn" disabled>Send Echo</button>
          <button onclick="sendBroadcast()" id="broadcastBtn" class="btn-secondary" disabled>Broadcast to All</button>
        </div>

        <hr style="border-color: var(--card-border); margin: 18px 0 14px 0;">

        <h2>🚪 Room Channels</h2>
        <div class="row" style="margin-bottom: 10px;">
          <input type="text" id="roomInput" placeholder="Room name (e.g. general, announcements)" style="margin-bottom: 0;">
          <button onclick="joinRoom()" id="joinBtn" disabled>Join</button>
          <button onclick="leaveRoom()" id="leaveBtn" class="btn-secondary" disabled>Leave</button>
        </div>
        <div class="row">
          <input type="text" id="roomMsgInput" placeholder="Message to room..." style="margin-bottom: 0;">
          <button onclick="sendRoomMessage()" id="roomMsgBtn" disabled>Send</button>
        </div>
      </div>
    </div>

    <!-- Live Event Console -->
    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h2>📜 Real-Time Event Stream</h2>
        <button class="btn-secondary" onclick="clearLogs()" style="padding: 4px 10px; font-size: 0.75rem;">Clear</button>
      </div>
      <div id="logBox" class="log-box"></div>
    </div>
  </div>

  <script>
    let socket = null;

    function toggleAuthFields() {
      const type = document.getElementById("authType").value;
      document.getElementById("jwtGroup").style.display = type === "jwt" ? "block" : "none";
      document.getElementById("sessionGroup").style.display = type === "session" ? "block" : "none";
    }

    function addLog(tag, message, tagClass) {
      const box = document.getElementById("logBox");
      const entry = document.createElement("div");
      entry.className = "log-entry";
      const time = new Date().toLocaleTimeString();
      entry.innerHTML = \`<span class="log-time">[\${time}]</span><span class="log-tag \${tagClass}">[\${tag}]</span> \${escapeHtml(message)}\`;
      box.appendChild(entry);
      box.scrollTop = box.scrollHeight;
    }

    function escapeHtml(str) {
      return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function clearLogs() {
      document.getElementById("logBox").innerHTML = "";
    }

    function setConnected(connected, info = "") {
      const badge = document.getElementById("connectionBadge");
      const connectBtn = document.getElementById("connectBtn");
      const disconnectBtn = document.getElementById("disconnectBtn");
      const echoBtn = document.getElementById("echoBtn");
      const broadcastBtn = document.getElementById("broadcastBtn");
      const joinBtn = document.getElementById("joinBtn");
      const leaveBtn = document.getElementById("leaveBtn");
      const roomMsgBtn = document.getElementById("roomMsgBtn");

      if (connected) {
        badge.className = "badge badge-connected";
        badge.innerText = "Connected " + (info ? "(" + info + ")" : "");
        connectBtn.disabled = true;
        disconnectBtn.disabled = false;
        echoBtn.disabled = false;
        broadcastBtn.disabled = false;
        joinBtn.disabled = false;
        leaveBtn.disabled = false;
        roomMsgBtn.disabled = false;
      } else {
        badge.className = "badge badge-disconnected";
        badge.innerText = "Disconnected";
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        echoBtn.disabled = true;
        broadcastBtn.disabled = true;
        joinBtn.disabled = true;
        leaveBtn.disabled = true;
        roomMsgBtn.disabled = true;
      }
    }

    function connectSocket() {
      if (socket) {
        socket.disconnect();
      }

      const authType = document.getElementById("authType").value;
      const auth = {};
      if (authType === "jwt") {
        const token = document.getElementById("tokenInput").value.trim();
        if (token) auth.token = token;
      } else {
        const sessionId = document.getElementById("sessionIdInput").value.trim();
        if (sessionId) auth.sessionId = sessionId;
      }

      addLog("SYSTEM", "Connecting to WebSocket with " + authType + " auth...", "tag-system");

      socket = io({
        auth,
        transports: ["websocket", "polling"]
      });

      socket.on("connect", () => {
        addLog("SYSTEM", "Socket transport connected (id: " + socket.id + ")", "tag-system");
      });

      socket.on("connection:success", (data) => {
        addLog("SYSTEM", data.message + " [User: " + data.user.email + ", Role: " + data.user.role + "]", "tag-system");
        setConnected(true, data.user.name);
      });

      socket.on("echo:response", (data) => {
        addLog("ECHO", data.message + " (" + data.timestamp + ")", "tag-echo");
      });

      socket.on("broadcast:message", (data) => {
        addLog("BROADCAST", data.sender.name + " (" + data.sender.email + "): " + data.message, "tag-broadcast");
      });

      socket.on("room:joined", (data) => {
        addLog("ROOM", data.message, "tag-room");
      });

      socket.on("room:left", (data) => {
        addLog("ROOM", data.message, "tag-room");
      });

      socket.on("room:message", (data) => {
        addLog("ROOM [" + data.room + "]", data.sender.name + ": " + data.message, "tag-room");
      });

      socket.on("system:notification", (data) => {
        addLog("SYSTEM", data.message, "tag-system");
      });

      socket.on("error", (data) => {
        addLog("ERROR", data.message, "tag-error");
      });

      socket.on("connect_error", (err) => {
        addLog("ERROR", "Handshake failed: " + err.message, "tag-error");
        setConnected(false);
      });

      socket.on("disconnect", (reason) => {
        addLog("SYSTEM", "Disconnected: " + reason, "tag-system");
        setConnected(false);
      });
    }

    function disconnectSocket() {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      setConnected(false);
    }

    function sendEcho() {
      if (!socket) return;
      const msg = document.getElementById("messageInput").value;
      addLog("SEND", "Echo request: " + msg, "tag-echo");
      socket.emit("echo", { message: msg });
    }

    function sendBroadcast() {
      if (!socket) return;
      const msg = document.getElementById("messageInput").value;
      addLog("SEND", "Broadcasting message: " + msg, "tag-broadcast");
      socket.emit("broadcast", { message: msg });
    }

    function joinRoom() {
      if (!socket) return;
      const room = document.getElementById("roomInput").value.trim();
      if (!room) return;
      socket.emit("room:join", { room });
    }

    function leaveRoom() {
      if (!socket) return;
      const room = document.getElementById("roomInput").value.trim();
      if (!room) return;
      socket.emit("room:leave", { room });
    }

    function sendRoomMessage() {
      if (!socket) return;
      const room = document.getElementById("roomInput").value.trim();
      const message = document.getElementById("roomMsgInput").value.trim();
      if (!room || !message) return;
      socket.emit("room:message", { room, message });
      document.getElementById("roomMsgInput").value = "";
    }
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
}
