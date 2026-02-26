"use client";

import { useState, useEffect } from "react";
import { UserCheck, UserPlus, UserMinus, Loader2, Clock } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import PageLoader from "@/components/PageLoader";
import LoadingButton from "@/components/LoadingButton";

export default function ConnectionsPage() {
    const [pending, setPending] = useState([]);
    const [active, setActive] = useState([]);
    const [sent, setSent] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConnections();
    }, []);

    const fetchConnections = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await api.get("/connections");
            const data = response.data;
            setPending(data.pending_received || []);
            setActive(data.active || []);
            setSent(data.sent_requests || []);
        } catch (error) {
            console.error("Failed to fetch connections:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const [processingId, setProcessingId] = useState(null);

    const handleAction = async (id, action) => {
        setProcessingId(`${id}-${action}`);
        const actionToast = toast.loading(`${action.charAt(0).toUpperCase() + action.slice(1)}ing connection...`);
        try {
            if (action === "accept") await api.patch(`/connect/${id}/accept`);
            else if (action === "reject") await api.patch(`/connect/${id}/reject`);
            else if (action === "dissolve") await api.patch(`/connect/${id}/dissolve`);

            toast.dismiss(actionToast);
            toast.success(`Connection ${action}ed ✨`);
            fetchConnections(true);
        } catch (error) {
            toast.dismiss(actionToast);
            console.error(`Failed to ${action} connection:`, error);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <PageLoader />;
    }

    return (
        <div className="flex flex-col gap-8">
            <section className="flex flex-col gap-2">
                <h1 className="font-serif font-bold text-3xl text-[#fce4ec]">Connections</h1>
                <p className="text-[#ffb3d9]">Manage your active and pending connections.</p>
            </section>

            {/* Pending Received */}
            <section className="flex flex-col gap-4">
                <h2 className="font-serif font-semibold text-xl text-[#fce4ec] flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-[#ff85c1]" /> Pending Requests
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pending.length === 0 ? (
                        <p className="text-[#ffb3d9] opacity-60 text-sm">No pending requests.</p>
                    ) : (
                        pending.map((conn) => (
                            <ConnectionCard
                                key={conn.id}
                                user={conn.user}
                                loading={processingId === `${conn.id}-accept` || processingId === `${conn.id}-reject`}
                                onAccept={() => handleAction(conn.id, "accept")}
                                onReject={() => handleAction(conn.id, "reject")}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Active Connections */}
            <section className="flex flex-col gap-4">
                <h2 className="font-serif font-semibold text-xl text-[#fce4ec] flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-[#4fffa3]" /> Active Connections
                </h2>
                <div className="grid grid-cols-1 gap-4">
                    {active.length === 0 ? (
                        <p className="text-[#ffb3d9] opacity-60 text-sm">No active connections.</p>
                    ) : (
                        active.map((conn) => (
                            <div key={conn.id} className="bg-[#3a0066] border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center font-bold text-pink-300">
                                        {conn.user.full_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-[#fce4ec] font-semibold">{conn.user.full_name}</h3>
                                        <p className="text-xs text-[#ffb3d9] opacity-70">Connected since {new Date(conn.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.location.href = `/dashboard/chat/${conn.id}`}
                                        className="px-4 py-2 rounded-lg bg-pink-500/10 text-pink-300 text-sm font-semibold border border-pink-500/20 hover:bg-pink-500/20 transition-all"
                                    >
                                        Chat
                                    </button>
                                    <LoadingButton
                                        onClick={() => handleAction(conn.id, "dissolve")}
                                        loading={processingId === `${conn.id}-dissolve`}
                                        className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-semibold border border-red-500/20 hover:bg-red-500/20 transition-all"
                                    >
                                        Dissolve
                                    </LoadingButton>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Sent Requests */}
            <section className="flex flex-col gap-4">
                <h2 className="font-serif font-semibold text-xl text-[#fce4ec] flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#ffb3d9]" /> Sent Requests
                </h2>
                <div className="flex flex-wrap gap-4">
                    {sent.length === 0 ? (
                        <p className="text-[#ffb3d9] opacity-60 text-sm">No sent requests.</p>
                    ) : (
                        sent.map((conn) => (
                            <div key={conn.id} className="bg-[#3a0066]/50 border border-white/5 rounded-lg px-4 py-2 text-sm text-[#ffb3d9]">
                                Requested {conn.user.full_name}
                            </div>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
}

function ConnectionCard({ user, onAccept, onReject, loading }) {
    return (
        <div className="bg-[#3a0066] border border-[#ff85c1]/20 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-pink-500/20 flex items-center justify-center text-xl font-bold text-pink-300">
                    {user.full_name[0]}
                </div>
                <div className="flex flex-col">
                    <h3 className="text-[#fce4ec] font-semibold">{user.full_name}</h3>
                    <p className="text-xs text-[#ffb3d9]">{user.occupation || "Member"}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <LoadingButton
                    onClick={onAccept}
                    loading={loading}
                    className="flex-1 bg-[#ff4fa3] text-white py-2 rounded-lg text-sm font-bold shadow-lg shadow-pink-500/20"
                >
                    Accept
                </LoadingButton>
                <button
                    onClick={onReject}
                    disabled={loading}
                    className="flex-1 bg-white/5 text-[#ffb3d9] py-2 rounded-lg text-sm font-bold border border-white/10 disabled:opacity-50"
                >
                    Ignore
                </button>
            </div>
        </div>
    );
}
