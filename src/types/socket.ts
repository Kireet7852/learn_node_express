import type { AuthUser } from "./auth.js";

export interface SocketData {
  user: AuthUser;
  sessionId?: string;
  authMethod: "jwt" | "session";
}

export interface ServerToClientEvents {
  "connection:success": (data: {
    message: string;
    socketId: string;
    user: AuthUser;
  }) => void;
  "echo:response": (data: {
    message: string;
    timestamp: string;
  }) => void;
  "broadcast:message": (data: {
    sender: {
      id: number;
      name: string;
      email: string;
    };
    message: string;
    timestamp: string;
  }) => void;
  "room:joined": (data: {
    room: string;
    message: string;
  }) => void;
  "room:left": (data: {
    room: string;
    message: string;
  }) => void;
  "room:message": (data: {
    room: string;
    sender: {
      id: number;
      name: string;
      email: string;
    };
    message: string;
    timestamp: string;
  }) => void;
  "system:notification": (data: {
    message: string;
    timestamp: string;
  }) => void;
  error: (data: {
    message: string;
  }) => void;
}

export interface ClientToServerEvents {
  echo: (data: { message: string }) => void;
  broadcast: (data: { message: string }) => void;
  "room:join": (data: { room: string }) => void;
  "room:leave": (data: { room: string }) => void;
  "room:message": (data: { room: string; message: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}
