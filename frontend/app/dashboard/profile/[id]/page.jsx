"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    MapPin, GraduationCap, Briefcase, Calendar, Clock,
    Info, Heart, MessageCircle, AlertCircle, ChevronDown, ChevronUp,
    Sparkles
} from "lucide-react";
import api from "@/lib/api";
import PageLoader from "@/components/PageLoader";

// ── Static accordion explanations ──────────────────────────────────────────
const ASTRO_EXPLANATIONS = [
    {
        term: "राशि (Rashi)",
        en: "Rashi",
        desc: "The zodiac sign where the Moon was positioned at the time of birth. It reflects emotional nature and personality.",
    },
    {
        term: "सूर्य राशि (Sun Sign)",
        en: "Sun Sign",
        desc: "The zodiac sign where the Sun was positioned at birth. It governs the core identity and life purpose.",
    },
    {
        term: "लग्न (Ascendant)",
        en: "Ascendant",
        desc: "The sign rising on the eastern horizon at the moment of birth. It shapes appearance and outward behavior.",
    },
    {
        term: "नक्षत्र (Nakshatra)",
        en: "Nakshatra",
        desc: "One of 27 lunar constellations. It goes deeper than Rashi and defines your traits, instincts, and destiny.",
    },
    {
        term: "गण (Gana)",
        en: "Gana",
        desc: "The temperament category: Deva (divine/gentle), Manushya (human/balanced), or Rakshasa (intense/assertive).",
    },
    {
        term: "नाड़ी (Nadi)",
        en: "Nadi",
        desc: "One of three energy channels (Adi, Madhya, Antya). Partners with the same Nadi are considered incompatible in traditional matching.",
    },
    {
        term: "योनि (Yoni)",
        en: "Yoni",
        desc: "A symbolic animal associated with your Nakshatra, used to assess physical and temperamental compatibility.",
    },
    {
        term: "वर्ण (Varna)",
        en: "Varna",
        desc: "A spiritual category (Brahmin, Kshatriya, Vaishya, Shudra) derived from the Moon sign. Used in Kundli matching.",
    },
    {
        term: "तिथि (Tithi)",
        en: "Tithi",
        desc: "The lunar day at the time of birth, based on the Moon–Sun angular difference. There are 30 tithis in a lunar month.",
    },
    {
        term: "मांगलिक स्थिति (Manglik)",
        en: "Manglik Status",
        desc: "Indicates whether Mars is placed in houses 1, 2, 4, 7, 8, or 12 from the Ascendant — a key factor in compatibility.",
    },
];

// ── Primary highlight field card ───────────────────────────────────────────
function PrimaryAstroCard({ label, hi, field }) {
    if (!field) return null;
    return (
        <div
            className="flex flex-col items-center justify-center rounded-[20px] text-center"
            style={{
                padding: "24px 16px",
                background: "rgba(255, 133, 193, 0.06)",
                border: "1px solid rgba(255, 133, 193, 0.18)",
                gap: "6px",
                boxShadow: "0 0 20px rgba(255, 79, 163, 0.06)",
            }}
        >
            <span
                className="font-sans font-bold tracking-wide"
                style={{ fontSize: "12px", color: "#ff85c1", opacity: 0.6, letterSpacing: "0.1em" }}
            >
                {label}
            </span>
            <span
                className="font-serif font-bold"
                style={{ fontSize: "clamp(20px, 3vw, 26px)", color: "#fce4ec", lineHeight: 1.1 }}
            >
                {field.en.toUpperCase()}
            </span>
            <span
                className="font-sans italic"
                style={{ fontSize: "15px", color: "#ffb3d9", opacity: 0.75 }}
            >
                {field.hi}
            </span>
        </div>
    );
}

// ── Secondary small card ───────────────────────────────────────────────────
function SecondaryAstroCard({ label, hi, field }) {
    if (!field) return null;
    return (
        <div
            className="flex flex-col rounded-[16px]"
            style={{
                padding: "16px 18px",
                background: "#260042",
                border: "1px solid rgba(255, 133, 193, 0.1)",
                gap: "4px",
            }}
        >
            <span
                className="font-sans"
                style={{ fontSize: "11px", color: "#ff85c1", opacity: 0.55, letterSpacing: "0.08em", fontWeight: 600, textTransform: "uppercase" }}
            >
                {label}
            </span>
            <span
                className="font-sans font-semibold"
                style={{ fontSize: "15px", color: "#fce4ec" }}
            >
                {field.en}
            </span>
            <span
                className="font-sans italic"
                style={{ fontSize: "12px", color: "#ffb3d9", opacity: 0.65 }}
            >
                {hi}
            </span>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [astroProfile, setAstroProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accordionOpen, setAccordionOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchAll();
        }
    }, [id]);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [profileRes, astroRes] = await Promise.allSettled([
                api.get(`/profile/${id}`),
                api.get(`/astrology/chart/${id}/profile`),
            ]);

            if (profileRes.status === "fulfilled") {
                setProfile(profileRes.value.data);
            } else {
                const status = profileRes.reason?.response?.status;
                setError(status === 403 ? "This profile is private or locked." : "Profile not found.");
            }

            if (astroRes.status === "fulfilled") {
                setAstroProfile(astroRes.value.data);
            }
            // Astro profile is optional — no error if chart doesn't exist
        } catch (err) {
            setError("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <PageLoader />;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
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

    const isManglik = astroProfile?.manglik?.en === "Yes";

    return (
        <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-16">

            {/* ── Hero ─────────────────────────────────────────────────────────── */}
            <section
                className="relative rounded-[32px] overflow-hidden"
                style={{ background: "#2b004b", border: "1px solid rgba(255, 133, 193, 0.15)" }}
            >
                <div className="flex flex-col md:flex-row gap-8 p-8 md:p-12">
                    {/* Photo */}
                    <div className="flex-shrink-0">
                        <div
                            className="w-48 h-48 md:w-64 md:h-64 rounded-[24px] overflow-hidden border-4 shadow-2xl relative"
                            style={{
                                borderColor: "rgba(255,133,193,0.2)",
                                background: "linear-gradient(135deg, rgba(255,79,163,0.12), rgba(255,133,193,0.06))",
                            }}
                        >
                            {profile.photo_url ? (
                                <img
                                    src={profile.photo_url}
                                    alt={profile.full_name}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-6xl font-serif font-bold text-[#ff85c1]/20">
                                    {profile.full_name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-4 justify-center">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#fce4ec]">
                                {profile.full_name}
                            </h1>
                            <p className="text-[#ffb3d9] text-lg font-sans">
                                {profile.profession || profile.occupation_label || profile.occupation}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3a0066] border border-[#ff85c1]/20">
                                <Calendar className="h-4 w-4 text-[#ff85c1]" />
                                <span className="text-sm text-[#fce4ec]">
                                    {new Date().getFullYear() - new Date(profile.dob).getFullYear()} Years
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3a0066] border border-[#ff85c1]/20">
                                <MapPin className="h-4 w-4 text-[#ff85c1]" />
                                <span className="text-sm text-[#fce4ec]">{profile.birth_place}</span>
                            </div>
                            {(profile.religion_label || profile.religion) && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3a0066] border border-[#ff85c1]/20">
                                    <Heart className="h-4 w-4 text-[#ff85c1]" />
                                    <span className="text-sm text-[#fce4ec]">
                                        {profile.religion_label || profile.religion}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-2">
                            <button className="px-8 py-3 bg-gradient-to-r from-[#ff4fa3] to-[#ff2d55] text-white rounded-full font-bold shadow-lg transition-transform hover:-translate-y-1">
                                Send Request
                            </button>
                            <button className="p-3 bg-[#3a0066] border border-[#ff85c1]/30 text-[#ff85c1] rounded-full hover:bg-[#4a0088] transition-colors">
                                <MessageCircle className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Details Grid ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* About */}
                <section className="p-8 rounded-[24px]" style={{ background: "#3a0066", border: "1px solid rgba(255, 133, 193, 0.1)" }}>
                    <div className="flex items-center gap-3 mb-6">
                        <Info className="h-5 w-5 text-[#ff85c1]" />
                        <h2 className="text-xl font-serif font-bold text-[#fce4ec]">About Me</h2>
                    </div>
                    <p className="text-[#ffb3d9] leading-relaxed font-sans">
                        {profile.about || "No bio provided."}
                    </p>
                </section>

                {/* Career */}
                <section className="p-8 rounded-[24px]" style={{ background: "#3a0066", border: "1px solid rgba(255, 133, 193, 0.1)" }}>
                    <div className="flex items-center gap-3 mb-6">
                        <Briefcase className="h-5 w-5 text-[#ff85c1]" />
                        <h2 className="text-xl font-serif font-bold text-[#fce4ec]">Career & Education</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-[#ff85c1]/60 uppercase tracking-wider">Education</span>
                            <span className="text-[#fce4ec] font-sans">
                                {profile.education_label || profile.education || "N/A"}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-[#ff85c1]/60 uppercase tracking-wider">Occupation</span>
                            <span className="text-[#fce4ec] font-sans">
                                {profile.occupation_label || profile.occupation || "N/A"}
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {/* ── Calculated Profile (Kundli) ───────────────────────────────────── */}
            {astroProfile && (
                <section
                    className="flex flex-col rounded-[28px]"
                    style={{
                        background: "#2e0054",
                        border: "1px solid rgba(255, 133, 193, 0.14)",
                        padding: "32px",
                        gap: "28px",
                    }}
                >
                    {/* Section header */}
                    <div className="flex flex-col" style={{ gap: "4px" }}>
                        <div className="flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-[#ff85c1]" />
                            <h2 className="font-serif font-bold text-[#fce4ec]" style={{ fontSize: "22px" }}>
                                Calculated Profile
                            </h2>
                        </div>
                        <p className="font-sans italic" style={{ fontSize: "13px", color: "#ffb3d9", opacity: 0.65, marginLeft: "32px" }}>
                            जन्म विवरण के आधार पर विश्लेषण
                        </p>
                    </div>

                    {/* Primary highlights: Moon Sign, Ascendant, Nakshatra */}
                    <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "12px" }}>
                        <PrimaryAstroCard label="राशि · Moon Sign" hi={astroProfile.moon_sign.hi} field={astroProfile.moon_sign} />
                        <PrimaryAstroCard label="लग्न · Ascendant" hi={astroProfile.ascendant.hi} field={astroProfile.ascendant} />
                        <PrimaryAstroCard label="नक्षत्र · Nakshatra" hi={astroProfile.nakshatra.hi} field={astroProfile.nakshatra} />
                    </div>

                    {/* Secondary 2-col grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: "10px" }}>
                        <SecondaryAstroCard label="सूर्य राशि · Sun Sign" hi={astroProfile.sun_sign.hi} field={astroProfile.sun_sign} />
                        <SecondaryAstroCard label="गण · Gana" hi={astroProfile.gana.hi} field={astroProfile.gana} />
                        <SecondaryAstroCard label="नाड़ी · Nadi" hi={astroProfile.nadi.hi} field={astroProfile.nadi} />
                        <SecondaryAstroCard label="योनि · Yoni" hi={astroProfile.yoni.hi} field={astroProfile.yoni} />
                        <SecondaryAstroCard label="वर्ण · Varna" hi={astroProfile.varna.hi} field={astroProfile.varna} />
                        <SecondaryAstroCard label="तिथि · Tithi" hi={astroProfile.tithi.hi} field={astroProfile.tithi} />
                    </div>

                    {/* Manglik card */}
                    <div
                        className="flex items-center justify-between rounded-[16px]"
                        style={{
                            padding: "16px 22px",
                            background: isManglik ? "rgba(255, 68, 68, 0.06)" : "rgba(79, 255, 163, 0.06)",
                            border: `1px solid ${isManglik ? "rgba(255, 80, 80, 0.35)" : "rgba(79, 255, 163, 0.3)"}`,
                        }}
                    >
                        <div className="flex flex-col" style={{ gap: "2px" }}>
                            <span
                                className="font-sans font-semibold"
                                style={{ fontSize: "13px", color: isManglik ? "#ff6b6b" : "#4fffa3", letterSpacing: "0.06em" }}
                            >
                                मांगलिक स्थिति
                            </span>
                            <span className="font-sans" style={{ fontSize: "11px", color: "#ffb3d9", opacity: 0.6 }}>
                                Manglik Status
                            </span>
                        </div>
                        <div
                            className="flex items-center gap-2 px-5 py-2 rounded-full font-serif font-bold"
                            style={{
                                background: isManglik ? "rgba(255, 68, 68, 0.15)" : "rgba(79, 255, 163, 0.12)",
                                color: isManglik ? "#ff6b6b" : "#4fffa3",
                                fontSize: "16px",
                            }}
                        >
                            <span>{isManglik ? "हाँ" : "नहीं"}</span>
                            <span style={{ opacity: 0.6, fontSize: "13px" }}>({astroProfile.manglik.en})</span>
                        </div>
                    </div>

                    {/* Accordion: Know What These Mean */}
                    <div className="flex flex-col" style={{ gap: "0" }}>
                        <button
                            onClick={() => setAccordionOpen(v => !v)}
                            className="flex items-center justify-between w-full rounded-[16px] transition-colors duration-200"
                            style={{
                                padding: "14px 20px",
                                background: "rgba(255, 133, 193, 0.04)",
                                border: "1px solid rgba(255, 133, 193, 0.1)",
                                cursor: "pointer",
                            }}
                            aria-expanded={accordionOpen}
                        >
                            <span className="font-sans font-semibold" style={{ fontSize: "14px", color: "#ffb3d9" }}>
                                💡 Know What These Mean
                            </span>
                            {accordionOpen
                                ? <ChevronUp className="h-4 w-4 text-[#ff85c1]" />
                                : <ChevronDown className="h-4 w-4 text-[#ff85c1]" />
                            }
                        </button>

                        {accordionOpen && (
                            <div
                                className="flex flex-col rounded-b-[16px]"
                                style={{
                                    padding: "4px 0 0 0",
                                    gap: "0",
                                    animation: "fadeIn 0.2s ease",
                                }}
                            >
                                {ASTRO_EXPLANATIONS.map((item, i) => (
                                    <div
                                        key={i}
                                        className="flex flex-col"
                                        style={{
                                            padding: "14px 20px",
                                            borderBottom: i < ASTRO_EXPLANATIONS.length - 1
                                                ? "1px solid rgba(255,133,193,0.07)"
                                                : "none",
                                            gap: "4px",
                                        }}
                                    >
                                        <span
                                            className="font-sans font-semibold"
                                            style={{ fontSize: "13px", color: "#ff85c1" }}
                                        >
                                            {item.term}
                                        </span>
                                        <p
                                            className="font-sans"
                                            style={{ fontSize: "13px", color: "#ffb3d9", lineHeight: 1.6, opacity: 0.8 }}
                                        >
                                            {item.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
