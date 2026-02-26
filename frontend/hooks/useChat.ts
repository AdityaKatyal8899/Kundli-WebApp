import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/lib/api";

export function useChat(connectionId: string) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    const fetchHistory = useCallback(async () => {
        try {
            const response = await api.get(`/chat/${connectionId}`);
            setMessages(response.data);
            // Mark as read
            await api.patch(`/chat/${connectionId}/read`);
        } catch (error) {
            console.error("Failed to fetch chat history:", error);
        } finally {
            setLoading(false);
        }
    }, [connectionId]);

    useEffect(() => {
        fetchHistory();

        const token = localStorage.getItem("token");
        const wsUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace("http", "ws")}/chat/ws/${connectionId}?token=${token}`;

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setActive(true);
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev: any[]) => [...prev, data]);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
            setActive(false);
        };

        return () => {
            socket.close();
        };
    }, [connectionId, fetchHistory]);

    const sendMessage = (content: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ content }));
        }
    };

    return { messages, loading, active, sendMessage };
}
