"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, User, Users, Globe, Clock, Calendar } from "lucide-react";
import api from "@/lib/api";
import NorthIndianChart from "@/components/astrology/NorthIndianChart";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";
import PageLoader from "@/components/PageLoader";
import StatusCard from "@/components/StatusCard";

export default function AstrologyPage() {
    const [activeTab, setActiveTab] = useState("create");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [astroProfile, setAstroProfile] = useState(null);

    const [formData, setFormData] = useState({
        day: "",
        month: "",
        year: "",
        hour: "12",
        minute: "00",
        lat: "",
        lon: ""
    });

    const [matchData, setMatchData] = useState({
        p1: { dob: "", tob: "", lat: "", lon: "" },
        p2: { dob: "", tob: "", lat: "", lon: "" }
    });

    // Load user's chart on mount
    useEffect(() => {
        const fetchChart = async () => {
            try {
                const response = await api.get("/astrology/chart");
                const chart = response.data;
                const dob = new Date(chart.birth_date);
                setFormData({
                    day: dob.getDate().toString(),
                    month: (dob.getMonth() + 1).toString(),
                    year: dob.getFullYear().toString(),
                    hour: chart.birth_time.split(":")[0],
                    minute: chart.birth_time.split(":")[1],
                    lat: chart.latitude.toString(),
                    lon: chart.longitude.toString()
                });
                setResult({
                    type: "create",
                    data: {
                        asc_sign: getSignName(chart.chart_data.asc_sign),
                        moon_sign: getSignName(chart.chart_data.moon_sign),
                        nakshatra: getNakshatraName(chart.chart_data.nakshatra_index),
                        houses: chart.chart_data.houses,
                        is_manglik: chart.chart_data.is_manglik
                    }
                });
            } catch (err) {
                console.log("No chart found yet or error:", err);
            }
        };
        const fetchAstroProfile = async () => {
            try {
                const res = await api.get("/astrology/chart/profile");
                setAstroProfile(res.data);
            } catch (_) { /* no chart yet, silently skip */ }
        };
        fetchChart();
        fetchAstroProfile();
    }, []);

    const getSignName = (n) => {
        const signs = ["", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        return signs[n] || "Unknown";
    };

    const getNakshatraName = (n) => {
        const naks = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
        return naks[n] || "Unknown";
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const calcToast = toast.loading("Calculating your astrological chart...");

        const payload = {
            birth_date: `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`,
            birth_time: `${formData.hour.padStart(2, '0')}:${formData.minute.padStart(2, '0')}:00`,
            latitude: parseFloat(formData.lat),
            longitude: parseFloat(formData.lon)
        };

        try {
            const response = await api.post("/astrology/chart", payload);
            const chart = response.data;
            toast.dismiss(calcToast);
            toast.success("Chart generated successfully! ✨");
            setResult({
                type: "create",
                data: {
                    asc_sign: getSignName(chart.chart_data.asc_sign),
                    moon_sign: getSignName(chart.chart_data.moon_sign),
                    nakshatra: getNakshatraName(chart.chart_data.nakshatra_index),
                    houses: chart.chart_data.houses,
                    is_manglik: chart.chart_data.is_manglik
                }
            });
            // Also refresh the bilingual profile
            try {
                const profRes = await api.get("/astrology/chart/profile");
                setAstroProfile(profRes.data);
            } catch (_) { }
        } catch (err) {
            toast.dismiss(calcToast);
            console.error("Failed to generate chart:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleMatchSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const matchToast = toast.loading("Calculating compatibility score...");

        const payload = {
            person1: {
                birth_date: matchData.p1.dob,
                birth_time: matchData.p1.tob.includes(":") ? (matchData.p1.tob.length === 5 ? `${matchData.p1.tob}:00` : matchData.p1.tob) : "12:00:00",
                latitude: parseFloat(matchData.p1.lat),
                longitude: parseFloat(matchData.p1.lon)
            },
            person2: {
                birth_date: matchData.p2.dob,
                birth_time: matchData.p2.tob.includes(":") ? (matchData.p2.tob.length === 5 ? `${matchData.p2.tob}:00` : matchData.p2.tob) : "12:00:00",
                latitude: parseFloat(matchData.p2.lat),
                longitude: parseFloat(matchData.p2.lon)
            }
        };

        try {
            const response = await api.post("/astrology/match-data", payload);
            toast.dismiss(matchToast);
            toast.success("Compatibility calculation complete! ✨");
            setResult({
                type: "match",
                score: response.data.score.total,
                manglik: response.data.manglik_compatible ? "Balanced" : "Mismatch",
                breakdown: response.data.score.breakdown,
                person1_chart: response.data.person1_chart,
                person2_chart: response.data.person2_chart
            });
        } catch (err) {
            toast.dismiss(matchToast);
            console.error("Failed to match charts:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500" style={{ gap: "24px" }}>
            {/* Header */}
            <section className="flex flex-col" style={{ gap: "8px" }}>
                <h1
                    className="font-serif font-bold flex items-center gap-3"
                    style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#fce4ec" }}
                >
                    <Sparkles className="h-8 w-8 text-[#ff4fa3]" />
                    Vedic Astrology
                </h1>
                <p className="text-[#ffb3d9] opacity-80">Discover cosmic compatibility and generate your detailed birth chart.</p>
            </section>

            {/* Tabs */}
            <div
                className="flex p-1 rounded-xl"
                style={{
                    background: "rgba(58, 0, 102, 0.4)",
                    width: "fit-content",
                    border: "1px solid rgba(255, 133, 193, 0.1)"
                }}
            >
                <button
                    onClick={() => { setActiveTab("create"); setResult(null); }}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "create"
                        ? "bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] text-white shadow-lg shadow-[#ff2d55]/20"
                        : "text-[#ffb3d9] hover:text-[#fce4ec]"
                        }`}
                >
                    <User className="h-4 w-4" />
                    Create Kundli
                </button>
                <button
                    onClick={() => { setActiveTab("match"); setResult(null); }}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === "match"
                        ? "bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] text-white shadow-lg shadow-[#ff2d55]/20"
                        : "text-[#ffb3d9] hover:text-[#fce4ec]"
                        }`}
                >
                    <Users className="h-4 w-4" />
                    Match Kundli
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-8">
                {activeTab === "create" ? (
                    <div className="bg-[#3a0066]/40 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-sm max-w-xl">
                        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-[#ffb3d9] uppercase tracking-wider flex items-center gap-2">
                                        <Calendar className="h-3 w-3" /> Date of Birth
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <input
                                            type="number" placeholder="DD" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                            value={formData.day} onChange={e => setFormData({ ...formData, day: e.target.value })}
                                        />
                                        <input
                                            type="number" placeholder="MM" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                            value={formData.month} onChange={e => setFormData({ ...formData, month: e.target.value })}
                                        />
                                        <input
                                            type="number" placeholder="YYYY" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                            value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-[#ffb3d9] uppercase tracking-wider flex items-center gap-2">
                                        <Clock className="h-3 w-3" /> Time of Birth
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="number" placeholder="HH" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                            value={formData.hour} onChange={e => setFormData({ ...formData, hour: e.target.value })}
                                        />
                                        <input
                                            type="number" placeholder="MM" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                            value={formData.minute} onChange={e => setFormData({ ...formData, minute: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-[#ffb3d9] uppercase tracking-wider flex items-center gap-2">
                                        <Globe className="h-3 w-3" /> Latitude
                                    </label>
                                    <input
                                        type="number" step="any" placeholder="e.g. 28.6139" required
                                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                        value={formData.lat} onChange={e => setFormData({ ...formData, lat: e.target.value })}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-[#ffb3d9] uppercase tracking-wider flex items-center gap-2">
                                        <Globe className="h-3 w-3" /> Longitude
                                    </label>
                                    <input
                                        type="number" step="any" placeholder="e.g. 77.2090" required
                                        className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50 transition-colors"
                                        value={formData.lon} onChange={e => setFormData({ ...formData, lon: e.target.value })}
                                    />
                                </div>
                            </div>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                className="mt-4 bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] hover:opacity-90 text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#ff2d55]/20"
                            >
                                Generate Kundli
                            </LoadingButton>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        <form onSubmit={handleMatchSubmit} className="flex flex-col gap-8 items-center">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                                {/* Person 1 */}
                                <div className="bg-[#3a0066]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                                    <h3 className="text-[#fce4ec] font-serif font-semibold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                        <div className="h-6 w-6 rounded-full bg-[#ff4fa3]/20 flex items-center justify-center text-[#ff4fa3] text-xs font-bold">1</div>
                                        Person One
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="date" required placeholder="DOB"
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p1: { ...matchData.p1, dob: e.target.value } })}
                                        />
                                        <input
                                            type="time" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p1: { ...matchData.p1, tob: e.target.value } })}
                                        />
                                        <input
                                            type="number" step="any" placeholder="Latitude" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p1: { ...matchData.p1, lat: e.target.value } })}
                                        />
                                        <input
                                            type="number" step="any" placeholder="Longitude" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p1: { ...matchData.p1, lon: e.target.value } })}
                                        />
                                    </div>
                                </div>

                                {/* Person 2 */}
                                <div className="bg-[#3a0066]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                                    <h3 className="text-[#fce4ec] font-serif font-semibold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                                        <div className="h-6 w-6 rounded-full bg-[#ff4fa3]/20 flex items-center justify-center text-[#ff4fa3] text-xs font-bold">2</div>
                                        Person Two
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input
                                            type="date" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p2: { ...matchData.p2, dob: e.target.value } })}
                                        />
                                        <input
                                            type="time" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p2: { ...matchData.p2, tob: e.target.value } })}
                                        />
                                        <input
                                            type="number" step="any" placeholder="Latitude" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p2: { ...matchData.p2, lat: e.target.value } })}
                                        />
                                        <input
                                            type="number" step="any" placeholder="Longitude" required
                                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[#fce4ec] focus:outline-none focus:border-[#ff4fa3]/50"
                                            onChange={e => setMatchData({ ...matchData, p2: { ...matchData.p2, lon: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <LoadingButton
                                type="submit"
                                loading={loading}
                                className="bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] hover:opacity-90 text-white font-bold py-3 px-12 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg shadow-[#ff2d55]/20"
                            >
                                Match Kundli
                            </LoadingButton>
                        </form>
                    </div>
                )}

                {/* Results Section */}
                {result && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500 fade-in">
                        {result.type === "create" ? (
                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                {/* Chart Rendering */}
                                <div className="w-full lg:w-1/2 aspect-square">
                                    <NorthIndianChart chart={result.data} />
                                </div>

                                {/* Details Card — upgraded bilingual layout */}
                                <div className="flex-1 w-full bg-[#3a0066]/60 border border-[#ff4fa3]/20 rounded-2xl p-8 backdrop-blur-md">
                                    <div className="flex flex-col gap-6">

                                        {/* Title */}
                                        <div className="flex flex-col gap-1 border-b border-white/5 pb-5">
                                            <h4 className="text-[#fce4ec] font-serif font-bold text-xl">Calculated Profile</h4>
                                            <p className="text-xs text-[#ffb3d9] opacity-60 italic">जन्म विवरण के आधार पर विश्लेषण</p>
                                        </div>

                                        {astroProfile ? (
                                            <>
                                                {/* Primary 3 highlights */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { label: "राशि", sub: "Moon Sign", field: astroProfile.moon_sign },
                                                        { label: "लग्न", sub: "Ascendant", field: astroProfile.ascendant },
                                                        { label: "नक्षत्र", sub: "Nakshatra", field: astroProfile.nakshatra },
                                                    ].map(({ label, sub, field }) => (
                                                        <div key={sub} className="flex flex-col items-center text-center rounded-[14px] py-4 px-2" style={{ background: "rgba(255,133,193,0.06)", border: "1px solid rgba(255,133,193,0.15)" }}>
                                                            <span style={{ fontSize: "10px", color: "#ff85c1", opacity: 0.6, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{sub}</span>
                                                            <span className="font-serif font-bold text-[#fce4ec] mt-1" style={{ fontSize: "clamp(12px,2vw,16px)", lineHeight: 1.1 }}>{field.en.toUpperCase()}</span>
                                                            <span className="italic text-[#ffb3d9]" style={{ fontSize: "12px", opacity: 0.7, marginTop: "2px" }}>{label} · {field.hi}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Secondary 6-field grid */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { label: "सूर्य राशि", sub: "Sun Sign", field: astroProfile.sun_sign },
                                                        { label: "गण", sub: "Gana", field: astroProfile.gana },
                                                        { label: "नाड़ी", sub: "Nadi", field: astroProfile.nadi },
                                                        { label: "योनि", sub: "Yoni", field: astroProfile.yoni },
                                                        { label: "वर्ण", sub: "Varna", field: astroProfile.varna },
                                                        { label: "तिथि", sub: "Tithi", field: astroProfile.tithi },
                                                    ].map(({ label, sub, field }) => (
                                                        <div key={sub} className="rounded-[12px] p-3" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,133,193,0.08)" }}>
                                                            <span className="block" style={{ fontSize: "9px", color: "#ff85c1", opacity: 0.55, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{sub}</span>
                                                            <span className="block text-[#fce4ec] font-semibold" style={{ fontSize: "13px", marginTop: "2px" }}>{field.en}</span>
                                                            <span className="block italic text-[#ffb3d9]" style={{ fontSize: "11px", opacity: 0.6 }}>{label} · {field.hi}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Manglik card */}
                                                {(() => {
                                                    const isManglik = astroProfile.manglik.en === "Yes";
                                                    return (
                                                        <div className="flex items-center justify-between rounded-[14px] px-5 py-4" style={{
                                                            background: isManglik ? "rgba(255,68,68,0.06)" : "rgba(79,255,163,0.06)",
                                                            border: `1px solid ${isManglik ? "rgba(255,80,80,0.3)" : "rgba(79,255,163,0.28)"}`
                                                        }}>
                                                            <div>
                                                                <span className="block font-semibold" style={{ fontSize: "12px", color: isManglik ? "#ff6b6b" : "#4fffa3" }}>मांगलिक स्थिति</span>
                                                                <span className="block" style={{ fontSize: "10px", color: "#ffb3d9", opacity: 0.6 }}>Manglik Status</span>
                                                            </div>
                                                            <span className="font-serif font-bold px-4 py-1.5 rounded-full" style={{
                                                                fontSize: "15px",
                                                                color: isManglik ? "#ff6b6b" : "#4fffa3",
                                                                background: isManglik ? "rgba(255,68,68,0.12)" : "rgba(79,255,163,0.1)"
                                                            }}>
                                                                {astroProfile.manglik.hi} ({astroProfile.manglik.en})
                                                            </span>
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            /* Fallback for old data / chart not loaded via profile endpoint yet */
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <span className="text-[10px] uppercase font-bold text-[#ff4fa3]/60 tracking-widest block mb-1">Moon Sign</span>
                                                    <span className="text-[#fce4ec] font-semibold">{result.data.moon_sign}</span>
                                                </div>
                                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <span className="text-[10px] uppercase font-bold text-[#ff4fa3]/60 tracking-widest block mb-1">Ascendant</span>
                                                    <span className="text-[#fce4ec] font-semibold">{result.data.asc_sign}</span>
                                                </div>
                                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <span className="text-[10px] uppercase font-bold text-[#ff4fa3]/60 tracking-widest block mb-1">Nakshatra</span>
                                                    <span className="text-[#fce4ec] font-semibold">{result.data.nakshatra}</span>
                                                </div>
                                                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                                    <span className="text-[10px] uppercase font-bold text-[#ff4fa3]/60 tracking-widest block mb-1">Manglik</span>
                                                    <span className={result.data.is_manglik ? "text-red-400 font-semibold" : "text-green-400 font-semibold"}>
                                                        {result.data.is_manglik ? "Yes" : "No"}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {/* Side-by-Side Charts */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-center text-[#ffb3d9] text-xs font-bold uppercase tracking-widest">Person One Chart</h4>
                                        <div className="aspect-square">
                                            <NorthIndianChart chart={result.person1_chart} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-center text-[#ffb3d9] text-xs font-bold uppercase tracking-widest">Person Two Chart</h4>
                                        <div className="aspect-square">
                                            <NorthIndianChart chart={result.person2_chart} />
                                        </div>
                                    </div>
                                </div>

                                {/* Match Results Card */}
                                <div className="bg-[#3a0066]/60 border border-[#ff4fa3]/20 rounded-2xl p-8 backdrop-blur-md">
                                    <div className="flex flex-col items-center gap-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-40 w-40 rounded-full border-[8px] border-[#3a0066] shadow-[0_0_30px_rgba(255,45,85,0.2)] flex items-center justify-center bg-gradient-to-tr from-[#ff4fa3]/10 to-transparent relative overflow-hidden">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
                                                    <circle
                                                        cx="80" cy="80" r="70"
                                                        stroke="rgba(255, 79, 163, 0.1)" strokeWidth="8" fill="none"
                                                    />
                                                    <circle
                                                        cx="80" cy="80" r="70"
                                                        stroke="url(#scoreGradient)" strokeWidth="8" fill="none"
                                                        strokeDasharray={2 * Math.PI * 70}
                                                        strokeDashoffset={2 * Math.PI * 70 * (1 - result.score / 36)}
                                                        strokeLinecap="round"
                                                        className="drop-shadow-[0_0_8px_rgba(255,79,163,0.5)]"
                                                    />
                                                    <defs>
                                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#ff4fa3" />
                                                            <stop offset="100%" stopColor="#ff2d55" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-4xl font-serif font-bold text-white">{result.score}</span>
                                                    <span className="text-[10px] font-bold text-[#ffb3d9]/60 uppercase">Out of 36</span>
                                                </div>
                                            </div>
                                            <div className={`mt-2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${result.manglik === "Balanced" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                                                }`}>
                                                Manglik: {result.manglik}
                                            </div>
                                        </div>

                                        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                            {Object.entries(result.breakdown).map(([koota, points]) => (
                                                <div key={koota} className="bg-black/20 p-3 rounded-xl border border-white/5 flex flex-col items-center gap-1 transition-transform hover:scale-105">
                                                    <span className="text-[10px] uppercase font-bold text-[#ffb3d9]/40">{koota}</span>
                                                    <span className="text-[#fce4ec] font-serif font-bold">{points}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
