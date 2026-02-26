"use client";

import { useState, useEffect } from "react";
import { Eye, Clock, Lock, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useNotifications } from "@/hooks/useNotifications";
import PageLoader from "@/components/PageLoader";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profileViewCount, refresh } = useNotifications();
  const [unlocked, setUnlocked] = useState(true); // Force to true for testing

  useEffect(() => {
    fetchNotifications();
    checkUnlockStatus();
  }, []);

  const checkUnlockStatus = async () => {
    try {
      const resp = await api.get("/profile");
      setUnlocked(resp.data.is_unlocked);
    } catch (err) {
      console.error("Failed to check unlock status", err);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Assuming this endpoint returns a list of profile views
      const response = await api.get("/notifications/profile-views");
      setNotifications(response.data.views || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const blurName = (name) => {
    const parts = name.split(" ");
    return parts.map((p) => p[0] + "***").join(" ");
  };

  return (
    <div className="flex flex-col" style={{ gap: "24px" }}>
      {/* Header */}
      <section className="flex flex-col" style={{ gap: "8px" }}>
        <h1
          className="font-serif font-bold"
          style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "#fce4ec" }}
        >
          Notifications
        </h1>
        <p
          className="font-sans"
          style={{ fontSize: "15px", color: "#ffb3d9", lineHeight: 1.6 }}
        >
          See who has been viewing your profile.
        </p>
        <div
          className="rounded-full"
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(90deg, #ff4fa3, #ff85c1)",
            marginTop: "8px",
          }}
        />
      </section>

      {/* Unlock Banner for Unpaid */}
      {!unlocked && (
        <div
          className="flex items-center rounded-[14px]"
          style={{
            padding: "16px 20px",
            gap: "12px",
            background: "rgba(255, 133, 193, 0.04)",
            border: "1px solid rgba(255, 133, 193, 0.12)",
          }}
        >
          <Lock className="h-4 w-4 flex-shrink-0" style={{ color: "#ff85c1" }} />
          <p
            className="flex-1 font-sans"
            style={{ fontSize: "13px", color: "#ffb3d9", lineHeight: 1.5 }}
          >
            Names are hidden. Unlock KUNDLI Pack to see who viewed your profile.
          </p>
          <button
            className="flex-shrink-0 cursor-pointer rounded-full font-sans font-semibold transition-all duration-200 hover:-translate-y-[1px]"
            style={{
              padding: "8px 18px",
              fontSize: "12px",
              background: "linear-gradient(90deg, #ff4fa3, #ff2d55)",
              color: "#ffffff",
              border: "none",
              borderRadius: "999px",
              boxShadow: "0 4px 12px rgba(255, 45, 85, 0.3)",
            }}
          >
            Unlock
          </button>
        </div>
      )}

      {/* Notification Cards */}
      <div className="flex flex-col" style={{ gap: "12px" }}>
        {loading ? (
          <div className="py-12">
            <PageLoader />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-[#ffb3d9] opacity-60 text-sm">
            No recent profile views.
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center rounded-[16px] transition-all duration-200"
              style={{
                padding: "20px 24px",
                gap: "16px",
                background: "#3a0066",
                border: "1px solid rgba(255, 133, 193, 0.08)",
                boxShadow: "0 2px 8px rgba(43, 0, 75, 0.15)",
              }}
            >
              {/* Avatar */}
              <div
                className="flex flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "linear-gradient(135deg, rgba(255, 79, 163, 0.15), rgba(255, 133, 193, 0.08))",
                }}
              >
                {unlocked ? (
                  <span
                    className="font-serif font-semibold"
                    style={{ fontSize: "16px", color: "#ff85c1" }}
                  >
                    {getInitials(notification.user?.full_name || "User")}
                  </span>
                ) : (
                  <Lock className="h-4 w-4" style={{ color: "#ff85c1", opacity: 0.5 }} />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col" style={{ gap: "4px" }}>
                <p
                  className="font-sans"
                  style={{ fontSize: "14px", color: "#fce4ec", lineHeight: 1.4 }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      filter: unlocked ? "none" : "blur(4px)",
                      userSelect: unlocked ? "auto" : "none",
                    }}
                  >
                    {unlocked ? notification.user?.full_name : blurName(notification.user?.full_name || "User")}
                  </span>{" "}
                  <span style={{ color: "#ffb3d9" }}>viewed your profile</span>
                </p>
                <div className="flex items-center" style={{ gap: "4px" }}>
                  <Clock
                    className="h-3 w-3"
                    style={{ color: "#ffb3d9", opacity: 0.5 }}
                  />
                  <span
                    className="font-sans"
                    style={{ fontSize: "12px", color: "#ffb3d9", opacity: 0.6 }}
                  >
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* View icon */}
              <div
                className="flex flex-shrink-0 items-center justify-center rounded-[10px]"
                style={{
                  width: "36px",
                  height: "36px",
                  background: "rgba(255, 133, 193, 0.06)",
                }}
              >
                <Eye
                  className="h-4 w-4"
                  style={{ color: "#ff85c1", opacity: 0.6 }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
