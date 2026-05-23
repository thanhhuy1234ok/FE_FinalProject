// src/socket/socket.ts
import { io } from "socket.io-client";

export const socket = io("http://localhost:8080", {
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

export const connectSocket = (accessToken: string) => {
    if (socket.connected) return;

    socket.auth = {
        token: accessToken,
    };

    socket.connect();
};

export const disconnectSocket = () => {
    socket.disconnect();
};
