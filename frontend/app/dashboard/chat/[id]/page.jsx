"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Send, ChevronLeft, MoreVertical, Trash2, User, HeartCrack } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import api from "@/lib/api";
import PageLoader from "@/components/PageLoader";
import toast from "react-hot-toast";

export default function ChatPage() {
    const { id: connectionId } = useParams();
    const router = useRouter();
    const [connectionInfo, setConnectionInfo] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const { messages, loading, active, sendMessage } = useChat(connectionId);
    const [inputValue, setInputValue] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const [isActioning, setIsActioning] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(null); // { title, message, onConfirm, variant }
    const scrollRef = useRef(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                // Fetch me
                const { data: me } = await api.get("/profile");
                setCurrentUser(me);

                // Fetch connection/other user info
                const { data: connections } = await api.get(`/connections`);
                const all = [
                    ...(connections.active || []),
                    ...(connections.pending_received || []),
                    ...(connections.sent_requests || [])
                ];
                const found = all.find(c => c.id === connectionId);
                if (found) setConnectionInfo(found);
            } catch (error) {
                console.error("Failed to fetch chat context:", error);
            }
        };
        fetchContext();
    }, [connectionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue("");
    };

    const handleClearChat = () => {
        setMenuOpen(false);
        setConfirmDialog({
            title: "Clear Chat",
            message: "Are you sure you want to delete all messages? This can't be undone.",
            variant: "warn",
            onConfirm: async () => {
                setConfirmDialog(null);
                setIsActioning(true);
                const t = toast.loading("Clearing chat...");
                try {
                    await api.delete(`/chat/${connectionId}`);
                    toast.dismiss(t);
                    toast.success("Chat cleared!");
                } catch (err) {
                    toast.dismiss(t);
                    toast.error("Failed to clear chat.");
                } finally {
                    setIsActioning(false);
                }
            }
        });
    };

    const handleViewProfile = () => {
        setMenuOpen(false);
        if (connectionInfo?.user?.id) {
            router.push(`/profile/${connectionInfo.user.id}`);
        }
    };

    const handleDissolve = () => {
        setMenuOpen(false);
        setConfirmDialog({
            title: "Dissolve Connection",
            message: "Are you sure? This will permanently end your connection and you won't be able to chat until you reconnect.",
            variant: "danger",
            onConfirm: async () => {
                setConfirmDialog(null);
                setIsActioning(true);
                const t = toast.loading("Dissolving connection...");
                try {
                    await api.patch(`/connect/${connectionId}/dissolve`);
                    toast.dismiss(t);
                    toast.success("Connection dissolved.");
                    router.push("/dashboard/connections");
                } catch (err) {
                    toast.dismiss(t);
                    toast.error("Failed to dissolve connection.");
                } finally {
                    setIsActioning(false);
                }
            }
        });
    };

    const getInitials = (name) =>
        name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "U";

    if (loading || !currentUser) {
        return <PageLoader />;
    }

    const otherUser = connectionInfo?.user;

    return (
        <div className="relative flex flex-col h-[calc(100vh-120px)] bg-[#2b004b] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            {/* Custom Confirm Dialog */}
            {confirmDialog && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(20,0,40,0.75)", backdropFilter: "blur(8px)" }}>
                    <div
                        className="flex flex-col gap-5 p-7 rounded-3xl"
                        style={{
                            width: "100%",
                            maxWidth: "360px",
                            background: "#2b004b",
                            border: "1px solid rgba(255,133,193,0.2)",
                            boxShadow: "0 24px 60px rgba(0,0,0,0.7)"
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            <h3 className="font-serif font-bold text-lg text-[#fce4ec]">{confirmDialog.title}</h3>
                            <p className="text-sm text-[#ffb3d9] leading-relaxed">{confirmDialog.message}</p>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setConfirmDialog(null)}
                                className="px-5 py-2.5 text-sm font-semibold rounded-xl text-[#ffb3d9] bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDialog.onConfirm}
                                className={`px-5 py-2.5 text-sm font-bold rounded-xl text-white transition-all ${confirmDialog.variant === "danger"
                                        ? "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 shadow-lg shadow-red-500/20"
                                        : "bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] hover:opacity-90 shadow-lg shadow-pink-500/20"
                                    }`}
                            >
                                {confirmDialog.variant === "danger" ? "Dissolve" : "Clear"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Chat Header */}
            <div className="p-4 bg-[#3a0066]/80 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <ChevronLeft className="h-6 w-6 text-[#ffb3d9]" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-pink-500/20 border border-[#ff85c1]/20 flex items-center justify-center font-bold text-pink-300">
                            {otherUser ? getInitials(otherUser.full_name) : "U"}
                        </div>
                        <div>
                            <h2 className="text-[#fce4ec] font-semibold text-sm">
                                {otherUser ? otherUser.full_name : "Chat"}
                            </h2>
                            <div className="flex items-center gap-1.5">
                                <div className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#4fffa3]" : "bg-gray-500"}`} />
                                <span className="text-[10px] text-[#ffb3d9] uppercase tracking-widest font-medium opacity-70">
                                    {active ? "Online" : "Offline"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <MoreVertical className="h-5 w-5 text-[#ffb3d9]" />
                    </button>
                    {menuOpen && (
                        <div
                            className="absolute right-0 top-10 z-50 flex flex-col overflow-hidden rounded-2xl"
                            style={{
                                width: "210px",
                                background: "#2b004b",
                                border: "1px solid rgba(255, 133, 193, 0.2)",
                                boxShadow: "0 20px 48px rgba(0,0,0,0.6)"
                            }}
                        >
                            <button
                                onClick={handleViewProfile}
                                className="flex items-center gap-3 px-4 py-3.5 text-sm text-[#fce4ec] hover:bg-white/5 transition-colors text-left"
                            >
                                <User className="h-4 w-4 text-[#ff85c1] flex-shrink-0" />
                                View Profile
                            </button>
                            <button
                                onClick={handleClearChat}
                                disabled={isActioning}
                                className="flex items-center gap-3 px-4 py-3.5 text-sm text-[#fce4ec] hover:bg-white/5 transition-colors text-left border-t border-white/5 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4 text-[#ffb3d9] flex-shrink-0" />
                                Clear Chat
                            </button>
                            <button
                                onClick={handleDissolve}
                                disabled={isActioning}
                                className="flex items-center gap-3 px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left border-t border-white/5 disabled:opacity-50"
                            >
                                <HeartCrack className="h-4 w-4 flex-shrink-0" />
                                Dissolve Connection
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-[#2b004b]"
                style={{
                    backgroundImage: "radial-gradient(circle at 50% 50%, rgba(255, 79, 163, 0.05) 0%, transparent 100%)",
                }}
            >
                {messages.map((msg, idx) => {
                    const isMe = msg.sender_id === currentUser.user_id;
                    const prevMsg = idx > 0 ? messages[idx - 1] : null;
                    const showHeader = !isMe && prevMsg?.sender_id !== msg.sender_id;

                    return (
                        <div
                            key={msg.id || idx}
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                            {!isMe && showHeader && (
                                <span className="text-[11px] font-bold text-[#ff85c1] mb-1 ml-2 opacity-80">
                                    {otherUser?.full_name || "Recipient"}
                                </span>
                            )}
                            <div
                                className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl relative shadow-lg ${isMe
                                    ? "bg-gradient-to-br from-[#ff4fa3] to-[#ff2d55] text-white rounded-tr-none"
                                    : "bg-[#3a0066] text-[#fce4ec] border border-[#ff85c1]/10 rounded-tl-none"
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {msg.message}
                                </p>
                                <div className={`text-[10px] mt-1.5 font-medium flex items-center justify-end gap-1 ${isMe ? "text-white/70" : "text-[#ffb3d9]/60"
                                    }`}>
                                    {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                    {isMe && <div className="ml-1 opacity-70">✓✓</div>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#3a0066]/80 border-t border-white/10">
                <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-[#fce4ec] text-sm focus:outline-none focus:border-[#ff85c1] transition-all placeholder:text-[#ffb3d9]/30 shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="h-11 w-11 flex items-center justify-center bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-xl shadow-pink-500/20"
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
