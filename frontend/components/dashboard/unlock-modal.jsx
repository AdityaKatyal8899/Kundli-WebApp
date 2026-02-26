"use client";

import { X, Eye, Search, Bell, Layout } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import LoadingButton from "@/components/LoadingButton";

const benefits = [
  { icon: Search, text: "Your profile becomes searchable to compatible matches" },
  { icon: Eye, text: "View other unlocked profiles in browse mode" },
  { icon: Bell, text: "Receive profile view notifications" },
  { icon: Layout, text: "Access 3 profile layout styles" },
];

export default function UnlockModal({ open, onClose, onConfirm }) {
  const overlayRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setLoading(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleConfirm = async () => {
    setLoading(true);
    const payToast = toast.loading("Processing payment...");

    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast.dismiss(payToast);
    toast.success("Payment successful! Profile unlocked. ✨");
    onConfirm();
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "rgba(43, 0, 75, 0.7)",
        backdropFilter: "blur(4px)",
        padding: "24px",
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Unlock profile"
    >
      <div
        className="animate-fade-in-up relative w-full flex flex-col"
        style={{
          maxWidth: "440px",
          background: "#3a0066",
          borderRadius: "24px",
          border: "1px solid rgba(255, 133, 193, 0.2)",
          boxShadow:
            "0 24px 64px rgba(43, 0, 75, 0.5), 0 0 0 1px rgba(255, 133, 193, 0.08), 0 0 40px rgba(255, 79, 163, 0.08)",
          padding: "32px",
          gap: "24px",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200"
          style={{
            width: "32px",
            height: "32px",
            background: "rgba(255, 133, 193, 0.06)",
            border: "none",
          }}
          aria-label="Close modal"
        >
          <X className="h-4 w-4" style={{ color: "#ffb3d9" }} />
        </button>

        {/* Header */}
        <div className="flex flex-col" style={{ gap: "8px" }}>
          <h2
            className="font-serif font-bold"
            style={{ fontSize: "24px", color: "#fce4ec" }}
          >
            Unlock Your Profile
          </h2>
          <p
            className="font-sans"
            style={{ fontSize: "14px", color: "#ffb3d9", lineHeight: 1.6 }}
          >
            Unlocking your profile allows you to connect with compatible
            matches. Here is what you get:
          </p>
        </div>

        {/* Benefits list */}
        <div className="flex flex-col" style={{ gap: "12px" }}>
          {benefits.map((benefit) => (
            <div
              key={benefit.text}
              className="flex items-start rounded-[12px]"
              style={{
                padding: "12px 16px",
                gap: "12px",
                background: "rgba(255, 133, 193, 0.04)",
                border: "1px solid rgba(255, 133, 193, 0.06)",
              }}
            >
              <benefit.icon
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                style={{ color: "#ff85c1" }}
              />
              <span
                className="font-sans"
                style={{ fontSize: "14px", color: "#fce4ec", lineHeight: 1.5 }}
              >
                {benefit.text}
              </span>
            </div>
          ))}
        </div>

        {/* Price badge */}
        <div
          className="flex items-center justify-center rounded-[12px]"
          style={{
            padding: "16px",
            background: "rgba(255, 133, 193, 0.06)",
            border: "1px solid rgba(255, 133, 193, 0.12)",
          }}
        >
          <span
            className="font-sans font-semibold"
            style={{ fontSize: "15px", color: "#fce4ec" }}
          >
            {"One-time unlock fee: \u20B9100"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col" style={{ gap: "12px" }}>
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            className="w-full cursor-pointer transition-all duration-300 ease-out hover:-translate-y-[2px]"
            style={{
              padding: "18px 36px",
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
            Confirm & Pay
          </LoadingButton>
          <button
            onClick={onClose}
            className="w-full cursor-pointer transition-colors duration-200"
            style={{
              padding: "14px 36px",
              borderRadius: "999px",
              fontSize: "15px",
              fontWeight: 500,
              color: "#ffb3d9",
              background: "rgba(255, 133, 193, 0.06)",
              border: "1px solid rgba(255, 133, 193, 0.12)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
