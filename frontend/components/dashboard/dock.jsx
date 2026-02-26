"use client";

import { useState, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const dockItems = [
  {
    label: "Home",
    href: "/dashboard",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
        <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    label: "Search",
    href: "/dashboard/search",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
  },
  {
    label: "Connections",
    href: "/dashboard/connections",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    badgeKey: "connectionCount"
  },
  {
    label: "Chat",
    href: "/dashboard/chat",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
    badgeKey: "unreadChatCount"
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    label: "Astrology",
    href: "/astrology",
    icon: (props) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
        <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
];

export default function DashboardDock() {
  const pathname = usePathname();
  const router = useRouter();
  const dockRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mouseX, setMouseX] = useState(null);
  const notifications = useNotifications();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dockRef.current) return;
    const rect = dockRef.current.getBoundingClientRect();
    setMouseX(e.clientX - rect.left);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
    setHoveredIndex(null);
  }, []);

  const getScale = (index) => {
    if (mouseX === null) return 1;
    if (!dockRef.current) return 1;
    const items = dockRef.current.querySelectorAll("[data-dock-item]");
    if (!items[index]) return 1;
    const itemRect = items[index].getBoundingClientRect();
    const dockRect = dockRef.current.getBoundingClientRect();
    const itemCenter = itemRect.left + itemRect.width / 2 - dockRect.left;
    const distance = Math.abs(mouseX - itemCenter);
    const maxDistance = 120;
    if (distance > maxDistance) return 1;
    const scale = 1 + 0.35 * (1 - distance / maxDistance);
    return scale;
  };

  return (
    <nav
      ref={dockRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-end"
      style={{
        padding: "8px 14px",
        gap: "4px",
        background: "rgba(58, 0, 102, 0.85)",
        backdropFilter: "blur(16px)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 133, 193, 0.25)",
        boxShadow:
          "0 8px 32px rgba(43, 0, 75, 0.4), 0 0 15px rgba(255, 133, 193, 0.1), inset 0 1px 0 rgba(255, 133, 193, 0.05)",
      }}
      aria-label="Dashboard navigation"
    >
      {dockItems.map((item, index) => {
        const active = isActive(item.href);
        const scale = getScale(index);
        const Icon = item.icon;

        return (
          <button
            key={item.href}
            data-dock-item
            onClick={() => router.push(item.href)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="relative flex cursor-pointer flex-col items-center justify-center"
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "12px",
              background: active
                ? "rgba(255, 133, 193, 0.12)"
                : "transparent",
              border: "none",
              transform: `scale(${scale})`,
              transition: "transform 0.15s ease-out, background 0.2s ease",
              transformOrigin: "bottom center",
            }}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              style={{
                width: "20px",
                height: "20px",
                color: active ? "#ff85c1" : "#ffb3d9",
                opacity: active ? 1 : 0.65,
                transition: "color 0.2s ease, opacity 0.2s ease",
              }}
            />

            {/* Notification Badge */}
            {item.badgeKey && notifications[item.badgeKey] > 0 && (
              <div
                className="absolute flex items-center justify-center rounded-full font-sans text-white font-bold"
                style={{
                  top: "2px",
                  right: "2px",
                  width: "14px",
                  height: "14px",
                  fontSize: "8px",
                  background: "linear-gradient(90deg, #ff4fa3, #ff2d55)",
                  boxShadow: "0 2px 4px rgba(255, 45, 85, 0.4)",
                  border: "1.5px solid #3a0066",
                }}
              >
                {notifications[item.badgeKey] > 9 ? "9+" : notifications[item.badgeKey]}
              </div>
            )}

            {/* Active indicator dot */}
            {active && (
              <div
                className="absolute rounded-full"
                style={{
                  bottom: "4px",
                  width: "16px",
                  height: "3px",
                  background: "#ff85c1",
                  boxShadow: "0 0 8px rgba(255, 133, 193, 0.5)",
                  borderRadius: "999px",
                }}
              />
            )}

            {/* Tooltip on hover */}
            {hoveredIndex === index && (
              <div
                className="pointer-events-none absolute font-sans"
                style={{
                  bottom: "calc(100% + 8px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  background: "rgba(58, 0, 102, 0.95)",
                  border: "1px solid rgba(255, 133, 193, 0.15)",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#fce4ec",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 12px rgba(43, 0, 75, 0.4)",
                  animation: "fadeIn 0.15s ease-out",
                }}
              >
                {item.label}
              </div>
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function DashboardBranding() {
  return (
    <div
      className="fixed left-5 top-5 z-50 flex items-center"
      style={{
        gap: "10px",
        padding: "8px 16px",
        background: "rgba(43, 0, 75, 0.7)",
        backdropFilter: "blur(8px)",
        borderRadius: "999px",
        border: "1px solid rgba(255, 133, 193, 0.15)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
      }}
    >
      <Heart
        className="h-4 w-4"
        style={{ color: "#ff85c1" }}
        fill="#ff85c1"
      />
      <span
        className="font-serif font-bold"
        style={{
          fontSize: "18px",
          color: "#fce4ec",
          letterSpacing: "-0.01em",
        }}
      >
        KUNDLI
      </span>
    </div>
  );
}
