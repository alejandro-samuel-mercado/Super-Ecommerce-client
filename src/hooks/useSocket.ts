import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SOCKET_URL = API_URL.replace(/\/api$/, "");

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const socketInstance = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ["websocket"], 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {});

    socketInstance.on("connect_error", (err) => {});

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
};
