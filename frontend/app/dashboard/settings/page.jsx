"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Bell, Eye, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState({
    profileVisible: true,
    emailNotifications: true,
    profileViewAlerts: true,
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingItems = [
    {
      key: "profileVisible",
      icon: Eye,
      label: "Profile Visibility",
      desc: "Allow others to find and view your profile",
    },
    {
      key: "emailNotifications",
      icon: Bell,
      label: "Email Notifications",
      desc: "Receive email updates about profile views",
    },
    {
      key: "profileViewAlerts",
      icon: Shield,
      label: "Profile View Alerts",
      desc: "Get notified when someone views your profile",
    },
  ];

  return (
    <div className="flex flex-col" style={{ gap: "32px", maxWidth: "640px" }}>
      {/* Header */}
      <section className="flex flex-col" style={{ gap: "8px" }}>
        <h1
          className="font-serif font-bold"
          style={{ fontSize: "clamp(24px, 4vw, 32px)", color: "var(--foreground)" }}
        >
          Settings
        </h1>
        <p
          className="font-sans"
          style={{ fontSize: "15px", color: "var(--muted-foreground)", lineHeight: 1.6 }}
        >
          Manage your account preferences and privacy.
        </p>
        <div
          className="rounded-full"
          style={{
            width: "48px",
            height: "3px",
            background: "linear-gradient(90deg, var(--primary), #ff85c1)",
            marginTop: "8px",
          }}
        />
      </section>

      {/* Theme Preference */}
      <section
        className="rounded-[20px]"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "24px" }}>
          <h2
            className="font-serif font-semibold"
            style={{ fontSize: "20px", color: "var(--foreground)" }}
          >
            Theme Preference
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-3 rounded-xl p-4 transition-all ${theme === "dark"
                  ? "border-2 border-primary bg-primary/10"
                  : "border border-border bg-muted/50 hover:bg-muted"
                }`}
            >
              <Moon className={`h-6 w-6 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Dark Romantic</span>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Default theme</span>
              </div>
            </button>

            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-3 rounded-xl p-4 transition-all ${theme === "light"
                  ? "border-2 border-primary bg-primary/10"
                  : "border border-border bg-muted/50 hover:bg-muted"
                }`}
            >
              <Sun className={`h-6 w-6 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Soft Pink Light</span>
                <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>Gentle & bright</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Privacy & Notifications */}
      <section
        className="rounded-[20px]"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "24px" }}>
          <h2
            className="font-serif font-semibold"
            style={{ fontSize: "20px", color: "var(--foreground)" }}
          >
            Privacy & Notifications
          </h2>

          <div className="flex flex-col" style={{ gap: "0" }}>
            {settingItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                  style={{
                    padding: "20px 0",
                    borderTop:
                      index > 0 ? "1px solid rgba(255, 133, 193, 0.06)" : "none",
                  }}
                >
                  <div className="flex items-center" style={{ gap: "16px" }}>
                    <div
                      className="flex flex-shrink-0 items-center justify-center rounded-[10px]"
                      style={{
                        width: "40px",
                        height: "40px",
                        background: "rgba(255, 133, 193, 0.06)",
                      }}
                    >
                      <Icon className="h-[18px] w-[18px]" style={{ color: "#ff85c1" }} />
                    </div>
                    <div className="flex flex-col" style={{ gap: "2px" }}>
                      <span
                        className="font-sans font-medium"
                        style={{ fontSize: "14px", color: "var(--foreground)" }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="font-sans"
                        style={{ fontSize: "12px", color: "#ffb3d9", opacity: 0.7 }}
                      >
                        {item.desc}
                      </span>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleSetting(item.key)}
                    className="relative flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200"
                    style={{
                      width: "44px",
                      height: "24px",
                      background: settings[item.key]
                        ? "linear-gradient(90deg, #ff4fa3, #ff2d55)"
                        : "rgba(255, 133, 193, 0.12)",
                      border: "none",
                      padding: "2px",
                    }}
                    role="switch"
                    aria-checked={settings[item.key]}
                    aria-label={item.label}
                  >
                    <div
                      className="rounded-full transition-transform duration-200"
                      style={{
                        width: "20px",
                        height: "20px",
                        background: "#ffffff",
                        transform: settings[item.key]
                          ? "translateX(20px)"
                          : "translateX(0)",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      }}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Account Actions */}
      <section
        className="rounded-[20px]"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          padding: "32px",
        }}
      >
        <div className="flex flex-col" style={{ gap: "20px" }}>
          <h2
            className="font-serif font-semibold"
            style={{ fontSize: "20px", color: "var(--foreground)" }}
          >
            Account
          </h2>

          <div className="flex flex-col" style={{ gap: "12px" }}>
            <button
              onClick={() => router.push("/")}
              className="flex w-full cursor-pointer items-center justify-center rounded-[12px] font-sans transition-colors duration-200"
              style={{
                padding: "14px",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "var(--muted-foreground)",
                background: "var(--secondary)",
                border: "1px solid var(--border)",
              }}
            >
              Sign Out
            </button>

            <button
              className="flex w-full cursor-pointer items-center justify-center rounded-[12px] font-sans transition-colors duration-200"
              style={{
                padding: "14px",
                gap: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#ff6b6b",
                background: "rgba(255, 68, 68, 0.04)",
                border: "1px solid rgba(255, 68, 68, 0.1)",
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
