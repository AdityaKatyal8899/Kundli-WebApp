"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Search, Loader2 } from "lucide-react";
import api from "@/lib/api";
import PageLoader from "@/components/PageLoader";
import toast from "react-hot-toast";

export default function ChatInboxPage() {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchActiveConnections();
    }, []);

    const fetchActiveConnections = async () => {
        try {
            const response = await api.get("/connections");
            // Assuming active connections are in response.data.active
            setConnections(response.data.active || []);
        } catch (error) {
            console.error("Failed to fetch connections:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            <section className="flex flex-col gap-2">
                <h1 className="font-serif font-bold text-3xl text-[#fce4ec]">Messages</h1>
                <p className="text-[#ffb3d9]">Continue your conversations with your matches.</p>
            </section>

            {connections.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-[#3a0066]/50 rounded-3xl border border-white/5">
                    <div className="h-20 w-20 rounded-full bg-pink-500/10 flex items-center justify-center mb-6">
                        <MessageSquare className="h-10 w-10 text-pink-300 opacity-20" />
                    </div>
                    <h2 className="text-xl font-serif font-semibold text-[#fce4ec] mb-2">No messages yet</h2>
                    <p className="text-sm text-[#ffb3d9] max-w-xs mb-8">
                        Find people in search and send connection requests to start chatting.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/search")}
                        className="flex items-center gap-2 px-6 py-3 bg-[#ff4fa3] text-white rounded-full font-semibold shadow-lg shadow-pink-500/20 hover:scale-105 transition-all"
                    >
                        <Search className="h-4 w-4" />
                        Discover People
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {connections.map((conn) => (
                        <div
                            key={conn.id}
                            onClick={() => router.push(`/dashboard/chat/${conn.id}`)}
                            className="group cursor-pointer flex items-center justify-between p-4 bg-[#3a0066] border border-white/5 rounded-2xl hover:border-[#ff85c1]/30 hover:bg-[#44007a] transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="h-14 w-14 rounded-full bg-pink-500/20 flex items-center justify-center text-xl font-bold text-pink-300">
                                        {conn.user.full_name[0]}
                                    </div>
                                    {/* Status dot placeholder */}
                                    <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-[#3a0066] rounded-full" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-[#fce4ec] font-semibold group-hover:text-[#ff85c1] transition-colors">
                                        {conn.user.full_name}
                                    </h3>
                                    <p className="text-xs text-[#ffb3d9] opacity-70">
                                        {conn.last_message || "Start a conversation..."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <span className="text-[10px] text-[#ffb3d9] opacity-50 uppercase tracking-wider">
                                    {conn.last_message_time || ""}
                                </span>
                                {conn.unread_count > 0 && (
                                    <div className="bg-[#ff4fa3] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {conn.unread_count}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
