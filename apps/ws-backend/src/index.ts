import WebSocket, { WebSocketServer } from "ws";
import { createServer } from "http";
import express from "express";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const connectedUsers: Record<number, WebSocket> = {}; // { userId: WebSocket }
const projectRooms: Record<number, Set<number>> = {}; // { projectId: Set<userId> }

wss.on("connection", (ws) => {
  console.log("New WebSocket connection");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "join":
          connectedUsers[data.userId] = ws;
          break;

        case "addedToProject":
          projectRooms[data.projectId] ??= new Set();
          projectRooms[data.projectId]?.add(data.userId);
          connectedUsers[data.userId]?.send(JSON.stringify({ type: "projectAdded", projectId: data.projectId }));
          break;

        case "projectUpdated":
        case "progressUpdated":
          projectRooms[data.projectId]?.forEach((memberId) => {
            connectedUsers[memberId]?.send(JSON.stringify(data));
          });
          break;

        case "taskUpdated":
          connectedUsers[data.assigneeId]?.send(JSON.stringify({ type: "updateTask", taskId: data.taskId, status: data.status }));
          projectRooms[data.projectId]?.forEach((memberId) => {
            connectedUsers[memberId]?.send(JSON.stringify({ type: "projectTaskUpdate", taskId: data.taskId, status: data.status }));
          });
          break;
      }
    } catch (error) {
      console.error("WebSocket Error:", error);
    }
  });

  ws.on("close", () => {
    Object.keys(connectedUsers).forEach((userId) => {
      if (connectedUsers[parseInt(userId)] === ws) delete connectedUsers[parseInt(userId)];
    });
  });
});

server.listen(5000, () => console.log("WebSocket server running on port 5000"));
