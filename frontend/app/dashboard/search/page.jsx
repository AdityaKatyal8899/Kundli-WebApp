"use client";

import { useState, useEffect } from "react";
import { MapPin, GraduationCap, Eye, Lock, X, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import PageLoader from "@/components/PageLoader";
import LoadingButton from "@/components/LoadingButton";

const layoutOptions = [
  { value: "classic", label: "Classic Card Layout" },
  { value: "minimal", label: "Elegant Minimal Layout" },
  { value: "astrology", label: "Astrology Focus Layout" },
];

export default function SearchPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(true); // Temporarily true for testing
  const [selectedLayout, setSelectedLayout] = useState("classic");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [filters, setFilters] = useState({
    min_age: "",
    max_age: "",
    religion: "",
    education: "",
  });
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    fetchProfiles();
    // checkUnlockStatus(); // bypassed for testing
  }, [selectedLayout, filters]);

  // const checkUnlockStatus = async () => { ... } // bypassed

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        layout: selectedLayout,
      }).toString();
      const response = await api.get(`/search?${queryParams}`);
      setProfiles(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId) => {
    // if (!unlocked) {
    //   setShowConnectionModal(true);
    //   return;
    // }
    // Unlock temporarily bypassed for testing
    setConnectingId(userId);
    const connectToast = toast.loading("Sending connection request...");
    try {
      await api.post(`/connect/${userId}`);
      toast.dismiss(connectToast);
      toast.success("Connection request sent! ✨");
      // Optionally filter out or update the card state here
    } catch (error) {
      toast.dismiss(connectToast);
      console.error("Connection failed:", error);
    } finally {
      setConnectingId(null);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();


  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      {/* Header */}
      <section className="flex flex-col" style={{ gap: "8px" }}>
        <h1
          className="font-serif font-bold"
          style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#fce4ec" }}
        >
          Search Profiles
        </h1>
        <p
          className="font-sans"
          style={{ fontSize: "15px", color: "var(--muted-foreground)", lineHeight: 1.6 }}
        >
          Discover profiles based on your compatibility layout.
        </p>
        <div
          className="rounded-full"
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(90deg, var(--primary), var(--accent))",
            marginTop: "8px",
          }}
        />
      </section>

      {/* Search Bar / Layout Selector Area */}
      <section
        className="rounded-[20px]"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          padding: "24px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#ffb3d9]">Min Age</label>
              <input
                type="number"
                value={filters.min_age}
                onChange={(e) => setFilters(prev => ({ ...prev, min_age: e.target.value }))}
                className="bg-[#3a0066] border border-[#ff85c1] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#ffb3d9]">Max Age</label>
              <input
                type="number"
                value={filters.max_age}
                onChange={(e) => setFilters(prev => ({ ...prev, max_age: e.target.value }))}
                className="bg-[#3a0066] border border-[#ff85c1] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#ffb3d9]">Religion</label>
              <input
                type="text"
                value={filters.religion}
                onChange={(e) => setFilters(prev => ({ ...prev, religion: e.target.value }))}
                placeholder="Hindu, Muslim..."
                className="bg-[#3a0066] border border-[#ff85c1] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#ffb3d9]">Education</label>
              <input
                type="text"
                value={filters.education}
                onChange={(e) => setFilters(prev => ({ ...prev, education: e.target.value }))}
                placeholder="MBA, BTech..."
                className="bg-[#3a0066] border border-[#ff85c1] rounded-lg px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
            Result Layout Style
          </label>

          {/* Custom Select Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex w-full cursor-pointer items-center justify-between font-sans outline-none transition-all"
              style={{
                padding: "14px 20px",
                borderRadius: "16px",
                fontSize: "14px",
                color: "var(--foreground)",
                background: "#3a0066", // Fixed dark purple as requested
                border: "1px solid #ff85c1", // Specific border
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)"
              }}
            >
              <span>{layoutOptions.find(opt => opt.value === selectedLayout)?.label}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                style={{ color: "#ff85c1" }}
              />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute left-0 right-0 z-50 mt-2 overflow-hidden"
                style={{
                  background: "#3a0066",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 133, 193, 0.3)",
                  boxShadow: "0 8px 32px rgba(43, 0, 75, 0.6)",
                  animation: "fadeInUp 0.2s ease-out"
                }}
              >
                {layoutOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSelectedLayout(opt.value);
                      setIsDropdownOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center px-5 py-3.5 text-left text-[14px] transition-colors"
                    style={{
                      color: selectedLayout === opt.value ? "#ffffff" : "#fce4ec",
                      background: selectedLayout === opt.value ? "rgba(255, 133, 193, 0.2)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLayout !== opt.value) {
                        e.currentTarget.style.background = "rgba(255, 133, 193, 0.1)";
                        e.currentTarget.style.boxShadow = "inset 0 0 10px rgba(255, 133, 193, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLayout !== opt.value) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Profile Cards Grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        style={{ gap: "16px" }}
      >
        {loading ? (
          <div className="col-span-full py-12">
            <PageLoader />
          </div>
        ) : profiles.length === 0 ? (
          <div className="col-span-full flex h-64 items-center justify-center text-[#ffb3d9]">
            No profiles found matching your criteria.
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col rounded-[16px] transition-all duration-200 hover:-translate-y-[2px]"
              style={{
                background: "#3a0066",
                border: "1px solid rgba(255, 133, 193, 0.08)",
                boxShadow: "0 4px 16px rgba(43, 0, 75, 0.2)",
                overflow: "hidden",
              }}
            >
              {/* Profile Photo Placeholder */}
              <div
                className="flex items-center justify-center overflow-hidden"
                style={{
                  height: "220px",
                  background:
                    "linear-gradient(135deg, rgba(255, 79, 163, 0.12), rgba(255, 133, 193, 0.06))",
                }}
              >
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <span
                    className="font-serif font-bold"
                    style={{
                      fontSize: "42px",
                      color: "rgba(255, 133, 193, 0.3)",
                    }}
                  >
                    {getInitials(profile.full_name || "User")}
                  </span>
                )}
              </div>

              {/* Card Content */}
              <div className="flex flex-col" style={{ padding: "20px", gap: "12px" }}>
                <div className="flex flex-col" style={{ gap: "2px" }}>
                  <div className="flex items-center justify-between">
                    <h3
                      className="font-sans font-semibold"
                      style={{ fontSize: "16px", color: "#fce4ec" }}
                    >
                      {profile.full_name}
                    </h3>
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {profile.layout || "Classic"}
                    </span>
                  </div>
                  <span
                    className="font-sans"
                    style={{ fontSize: "13px", color: "#ffb3d9" }}
                  >
                    {calculateAge(profile.dob)} years
                  </span>
                </div>

                {/* Meta info */}
                <div className="flex flex-col" style={{ gap: "6px" }}>
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    <MapPin
                      className="h-3.5 w-3.5"
                      style={{ color: "#ffb3d9", opacity: 0.6 }}
                    />
                    <span
                      className="font-sans"
                      style={{ fontSize: "13px", color: "#ffb3d9" }}
                    >
                      {profile.birth_place || "Undisclosed"}
                    </span>
                  </div>
                  <div className="flex items-center" style={{ gap: "6px" }}>
                    <GraduationCap
                      className="h-3.5 w-3.5"
                      style={{ color: "#ffb3d9", opacity: 0.6 }}
                    />
                    <span
                      className="font-sans"
                      style={{ fontSize: "13px", color: "#ffb3d9" }}
                    >
                      {profile.profession || profile.occupation || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col" style={{ gap: "8px", marginTop: "4px" }}>
                  <button
                    onClick={() => router.push(`/profile/${profile.user_id}`)}
                    className="flex w-full cursor-pointer items-center justify-center rounded-[10px] font-sans transition-colors duration-200"
                    style={{
                      padding: "10px",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ff85c1",
                      background: "rgba(255, 133, 193, 0.06)",
                      border: "1px solid rgba(255, 133, 193, 0.12)",
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Profile
                  </button>

                  <LoadingButton
                    onClick={() => handleConnect(profile.user_id)}
                    loading={connectingId === profile.user_id}
                    className="flex w-full cursor-pointer items-center justify-center rounded-[10px] font-sans transition-colors duration-200"
                    style={{
                      padding: "10px",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                      background: "linear-gradient(90deg, #ff4fa3, #ff2d55)",
                      border: "none",
                      opacity: 1,
                    }}
                  >
                    Send Connection Request
                  </LoadingButton>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connection Request Gating Modal Bypassed for testing */}
    </div>
  );
}
