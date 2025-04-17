import React, { createContext, useContext, useEffect, useState } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
    const [stompClient, setStompClient] = useState(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = new SockJS("http://localhost:8080/ws");
        const client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("WebSocket connected");
                setConnected(true);
                setStompClient(client);
            },
            onDisconnect: () => {
                console.log("WebSocket disconnected");
                setConnected(false);
            },
            onStompError: (frame) => {
                console.error("WebSocket error:", frame);
            },
        });

        client.activate();

        return () => {
            client.deactivate();
            console.log("WebSocket cleanup");
        };
    }, []);

    return (
        <WebSocketContext.Provider value={{ stompClient, connected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocketContext = () => useContext(WebSocketContext);