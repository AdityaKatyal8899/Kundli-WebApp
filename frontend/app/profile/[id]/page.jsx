"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, GraduationCap, Briefcase, Calendar, Info, Heart, MessageCircle, AlertCircle, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import PageLoader from "@/components/PageLoader";

export default function PublicProfilePage() {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchProfile();
        }
    }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            // Using the public endpoint /users/{user_id} as requested
            const { data } = await api.get(`/users/${id}`);
            setProfile(data);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            if (err.response?.status === 403) {
                setError("This profile is private or locked.");
            } else {
                setError("Profile not found.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!profile?.id) return;

        setConnecting(true);
        // We use dynamic import for toast because it's client-side
        const { default: toast } = await import("react-hot-toast");
        const connectToast = toast.loading("Sending connection request...");

        try {
            await api.post(`/connect/${profile.id}`);
            toast.dismiss(connectToast);
            toast.success("Connection request sent! ✨");
        } catch (err) {
            toast.dismiss(connectToast);
            console.error("Connection failed:", err);
            toast.error(err.response?.data?.detail || "Failed to send request.");
        } finally {
            setConnecting(false);
        }
    };

    if (loading) return <PageLoader />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-[#2b004b] text-white">
                <AlertCircle className="h-12 w-12 text-[#ff4fa3]" />
                <h2 className="text-2xl font-serif font-bold text-[#fce4ec]">{error}</h2>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2 bg-[#3a0066] border border-[#ff85c1] text-white rounded-full hover:bg-[#4a0088] transition-colors"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#2b004b] text-[#fce4ec] selection:bg-[#ff4fa3]/30 selection:text-white">
            {/* Top Navbar for Public Profile */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md border-b border-[#ff85c1]/10 bg-[#2b004b]/80">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[#ffb3d9] hover:text-[#ff85c1] transition-colors group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-sans font-medium">Back</span>
                </button>
                <div className="font-serif text-xl font-bold tracking-tight bg-gradient-to-r from-[#ff4fa3] to-[#ffb3d9] bg-clip-text text-transparent">
                    KUNDLI
                </div>
                <div className="w-10"></div> {/* Spacer */}
            </nav>

            <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 pt-28 px-6">
                {/* Header / Hero Section */}
                <section className="relative rounded-[32px] overflow-hidden" style={{ background: "#3a0066", border: "1px solid rgba(255, 133, 193, 0.15)" }}>
                    <div className="flex flex-col md:flex-row gap-8 p-8 md:p-12 items-center md:items-start text-center md:text-left">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            <div
                                className="w-48 h-48 md:w-64 md:h-64 rounded-[32px] overflow-hidden border-4 border-[#ff85c1]/20 shadow-2xl relative"
                                style={{ background: "linear-gradient(135deg, rgba(255, 79, 163, 0.12), rgba(255, 133, 193, 0.06))" }}
                            >
                                {profile.photo_url ? (
                                    <img
                                        src={profile.photo_url}
                                        alt={profile.name}
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl font-serif font-bold text-[#ff85c1]/20">
                                        {profile.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="flex flex-col gap-4 justify-center flex-1">
                            <div className="flex flex-col gap-1">
                                <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#fce4ec] leading-tight">
                                    {profile.name}
                                </h1>
                                <p className="text-[#ffb3d9] text-xl font-sans mt-1">
                                    {profile.profession || "Professional Bio"}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2b004b] border border-[#ff85c1]/20">
                                    <MapPin className="h-4 w-4 text-[#ff85c1]" />
                                    <span className="text-sm font-medium text-[#fce4ec]">{profile.birth_place || "Secret Location"}</span>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2b004b] border border-[#ff85c1]/20">
                                    <Heart className="h-4 w-4 text-[#ff85c1]" />
                                    <span className="text-sm font-medium text-[#fce4ec]">{profile.religion || "Faith"}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 flex-col sm:flex-row">
                                <button
                                    onClick={handleConnect}
                                    disabled={connecting}
                                    className="px-10 py-4 bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] text-white rounded-full font-bold shadow-[0_8px_20px_-4px_rgba(255,79,163,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_24px_-4px_rgba(255,79,163,0.55)] active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {connecting ? "Connecting..." : "Connect Now"}
                                </button>
                                <button
                                    className="p-4 bg-[#2b004b] border border-[#ff85c1]/30 text-[#ff85c1] rounded-full hover:bg-[#4a0088] transition-all flex items-center justify-center"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Details Section */}
                <section className="p-10 rounded-[32px]" style={{ background: "#3a0066", border: "1px solid rgba(255, 133, 193, 0.1)" }}>
                    <div className="flex items-center gap-3 mb-8">
                        <Info className="h-6 w-6 text-[#ff85c1]" />
                        <h2 className="text-2xl font-serif font-bold text-[#fce4ec]">Professional Profile</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-[#ff85c1]/60 uppercase tracking-[0.2em]">Full Name</span>
                                <span className="text-xl text-[#fce4ec] font-sans font-medium">{profile.name}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-[#ff85c1]/60 uppercase tracking-[0.2em]">Education</span>
                                <span className="text-xl text-[#fce4ec] font-sans font-medium">{profile.education || "Undergraduate"}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-[#ff85c1]/60 uppercase tracking-[0.2em]">Profession</span>
                                <span className="text-xl text-[#fce4ec] font-sans font-medium">{profile.profession || "Industry Expert"}</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-[#ff85c1]/60 uppercase tracking-[0.2em]">Status</span>
                                <span className="text-xl text-[#4fffa3] font-sans font-medium">Verified Profile</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer info */}
                <p className="text-center text-[#ffb3d9]/40 text-sm font-sans italic">
                    Profile generated via KUNDLI compatibility matching engine • © 2026
                </p>
            </div>
        </div>
    );
}
