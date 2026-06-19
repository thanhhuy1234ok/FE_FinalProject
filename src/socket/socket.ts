// src/socket/socket.ts
import { io } from "socket.io-client";

export const socket = io("https://school-ag.xyz:8080", {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
});

socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);

    socket.emit("ping", { msg: "hello" }, (res: any) => {
        console.log("✅ PONG:", res);
    });
});

socket.on("notification:new", (data) => {
    console.log("🔔 SOCKET GLOBAL notification:new", data);
});

socket.on("connect_error", (err) => {
    console.log("❌ Socket connect error:", err.message);
});

socket.on("disconnect", (reason) => {
    console.log("🔌 Socket disconnected:", reason);
});

export const connectSocket = (token: string) => {
    socket.auth = { token };

    if (!socket.connected) {
        socket.connect();
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
