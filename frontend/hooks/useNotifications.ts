import { useState, useEffect } from "react";
import api from "@/lib/api";

export function useNotifications() {
    const [connectionCount, setConnectionCount] = useState(0);
    const [profileViewCount, setProfileViewCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const [connRes, viewRes, chatRes] = await Promise.all([
                api.get("/notifications/connections"),
                api.get("/notifications/profile-views"),
                api.get("/notifications/chats/unread"),
            ]);

            // Assuming response format is { count: X }
            setConnectionCount(connRes.data.count || 0);
            setProfileViewCount(viewRes.data.count || 0);
            setUnreadChatCount(chatRes.data.count || 0);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 20000); // 20s
        return () => clearInterval(interval);
    }, []);

    return { connectionCount, profileViewCount, unreadChatCount, refresh: fetchNotifications };
}
