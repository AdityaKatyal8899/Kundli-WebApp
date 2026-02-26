"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  UserPlus,
  Eye,
  Search,
  Bell,
  Layout,
  Shield,
  Check,
} from "lucide-react";
import UnlockModal from "@/components/dashboard/unlock-modal";

export default function DashboardPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(true); // Force to true for testing
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  return (
    <div className="flex flex-col" style={{ gap: "32px" }}>
      {/* Welcome Section */}
      <section className="flex flex-col" style={{ gap: "8px" }}>
        <h1
          className="font-serif font-bold text-balance"
          style={{
            fontSize: "clamp(28px, 4vw, 36px)",
            color: "#fce4ec",
            lineHeight: 1.2,
          }}
        >
          Welcome to KUNDLI
        </h1>
        <p
          className="max-w-[560px] font-sans"
          style={{ fontSize: "15px", color: "#ffb3d9", lineHeight: 1.6 }}
        >
          {unlocked
            ? "Your profile is now active. Explore compatible matches and manage your profile."
            : "Unlock your profile to connect and explore compatible matches."}
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

      {/* LOCKED: KUNDLI Pack Card */}
      {!unlocked && (
        <section
          className="rounded-[20px]"
          style={{
            background: "#3a0066",
            border: "1px solid rgba(255, 133, 193, 0.15)",
            boxShadow:
              "0 8px 32px rgba(43, 0, 75, 0.3), 0 0 0 1px rgba(255, 133, 193, 0.05), inset 0 1px 0 rgba(255, 133, 193, 0.05)",
            padding: "36px",
          }}
        >
          <div className="flex flex-col" style={{ gap: "24px" }}>
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <h2
                className="font-serif font-bold"
                style={{ fontSize: "22px", color: "#fce4ec" }}
              >
                {"Unlock KUNDLI Pack \u2013 \u20B9100 (One-Time)"}
              </h2>
              <p
                className="max-w-[480px] font-sans"
                style={{ fontSize: "14px", color: "#ffb3d9", lineHeight: 1.6 }}
              >
                Get full access to all features with a single payment.
              </p>
            </div>

            {/* Benefit list */}
            <ul className="flex flex-col" style={{ gap: "14px", listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Make your profile searchable",
                "Send connection requests",
                "Receive profile view notifications",
                "Choose from 3 profile layouts",
                "Access compatibility features (coming soon)",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start font-sans"
                  style={{ gap: "12px", fontSize: "14px", color: "#fce4ec", lineHeight: 1.5 }}
                >
                  <div
                    className="mt-0.5 flex flex-shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: "20px",
                      height: "20px",
                      background: "rgba(255, 133, 193, 0.1)",
                    }}
                  >
                    <Check className="h-3 w-3" style={{ color: "#ff85c1" }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            {/* Unlock button */}
            <button
              onClick={() => setShowUnlockModal(true)}
              className="w-full cursor-pointer transition-all duration-300 ease-out hover:-translate-y-[2px] sm:w-auto sm:self-start"
              style={{
                padding: "18px 40px",
                borderRadius: "999px",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.6px",
                background: "linear-gradient(90deg, #ff4fa3, #ff2d55)",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 8px 24px rgba(255, 45, 85, 0.35)",
              }}
            >
              <span className="flex items-center justify-center" style={{ gap: "8px" }}>
                <Lock className="h-4 w-4" />
                {"Unlock Now \u2013 \u20B9100"}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* LOCKED: Blurred feature previews */}
      {!unlocked && (
        <section className="relative">
          {/* Blur overlay */}
          <div
            className="pointer-events-none absolute inset-0 z-10 rounded-[20px]"
            style={{
              background: "rgba(43, 0, 75, 0.45)",
              backdropFilter: "blur(4px)",
            }}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px" }}>
            {[
              { label: "Browse Profiles", desc: "Explore compatible matches", icon: Eye },
              { label: "Edit Profile", desc: "Update your biodata and photos", icon: UserPlus },
              { label: "Notifications", desc: "See who viewed your profile", icon: Bell },
              { label: "Layout Style", desc: "Choose your profile layout", icon: Layout },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start rounded-[16px]"
                style={{
                  padding: "24px",
                  gap: "16px",
                  background: "#3a0066",
                  border: "1px solid rgba(255, 133, 193, 0.1)",
                }}
              >
                <div
                  className="flex flex-shrink-0 items-center justify-center rounded-[12px]"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "rgba(255, 133, 193, 0.08)",
                  }}
                >
                  <item.icon className="h-5 w-5" style={{ color: "#ff85c1" }} />
                </div>
                <div className="flex flex-col" style={{ gap: "4px" }}>
                  <span
                    className="font-sans font-semibold"
                    style={{ fontSize: "15px", color: "#fce4ec" }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="font-sans"
                    style={{ fontSize: "13px", color: "#ffb3d9", opacity: 0.8 }}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* UNLOCKED: Quick Actions */}
      {unlocked && (
        <section className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px" }}>
          {[
            {
              label: "Browse Profiles",
              desc: "Explore compatible matches",
              icon: Search,
              href: "/dashboard/search",
            },
            {
              label: "Edit Profile",
              desc: "Update your biodata and photos",
              icon: UserPlus,
              href: "/dashboard/profile",
            },
            {
              label: "Notifications",
              desc: "See who viewed your profile",
              icon: Bell,
              href: "/dashboard/notifications",
            },
            {
              label: "Layout Style",
              desc: "Choose your profile layout",
              icon: Layout,
              href: "/dashboard/profile",
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className="flex cursor-pointer items-start rounded-[16px] text-left transition-all duration-200 hover:-translate-y-[1px]"
              style={{
                padding: "24px",
                gap: "16px",
                background: "#3a0066",
                border: "1px solid rgba(255, 133, 193, 0.1)",
                boxShadow: "0 4px 16px rgba(43, 0, 75, 0.2)",
              }}
            >
              <div
                className="flex flex-shrink-0 items-center justify-center rounded-[12px]"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(255, 133, 193, 0.08)",
                }}
              >
                <item.icon className="h-5 w-5" style={{ color: "#ff85c1" }} />
              </div>
              <div className="flex flex-col" style={{ gap: "4px" }}>
                <span
                  className="font-sans font-semibold"
                  style={{ fontSize: "15px", color: "#fce4ec" }}
                >
                  {item.label}
                </span>
                <span
                  className="font-sans"
                  style={{ fontSize: "13px", color: "#ffb3d9", opacity: 0.8 }}
                >
                  {item.desc}
                </span>
              </div>
            </button>
          ))}
        </section>
      )}

      {/* Complete Profile Card (always visible) */}
      <section
        className="rounded-[20px]"
        style={{
          background: "#3a0066",
          border: "1px solid rgba(255, 133, 193, 0.1)",
          boxShadow: "0 4px 16px rgba(43, 0, 75, 0.2)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "16px" }}>
          <div className="flex flex-col" style={{ gap: "8px" }}>
            <h2
              className="font-serif font-semibold"
              style={{ fontSize: "22px", color: "#fce4ec" }}
            >
              Complete Your Profile
            </h2>
            <p
              className="max-w-[440px] font-sans"
              style={{ fontSize: "14px", color: "#ffb3d9", lineHeight: 1.6 }}
            >
              Add your biodata, birth details, and up to 10 photos.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/profile")}
            className="cursor-pointer transition-all duration-200 hover:-translate-y-[1px] sm:self-start"
            style={{
              padding: "14px 28px",
              borderRadius: "999px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#ff85c1",
              background: "rgba(255, 133, 193, 0.08)",
              border: "1px solid rgba(255, 133, 193, 0.2)",
            }}
          >
            <span className="flex items-center" style={{ gap: "8px" }}>
              <UserPlus className="h-4 w-4" />
              Start Setup
            </span>
          </button>
        </div>
      </section>

      {/* Unlock Modal */}
      <UnlockModal
        open={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onConfirm={() => {
          setUnlocked(true);
          setShowUnlockModal(false);
        }}
      />
    </div>
  );
}
