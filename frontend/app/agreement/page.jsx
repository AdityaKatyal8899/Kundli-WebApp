"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShieldCheck } from "lucide-react";

export default function AgreementPage() {
  const router = useRouter();
  const [checkOne, setCheckOne] = useState(false);
  const [checkTwo, setCheckTwo] = useState(false);

  const canProceed = checkOne && checkTwo;

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(160deg, #fff5fa 0%, #ffffff 50%, #fff0f6 100%)",
      }}
    >
      {/* Background constellation dots */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${3 + (i % 3) * 2}px`,
              height: `${3 + (i % 3) * 2}px`,
              background: "#ff4fa3",
              top: `${8 + i * 7.5}%`,
              left: `${5 + ((i * 17) % 90)}%`,
            }}
          />
        ))}
      </div>

      <div
        className="animate-fade-in-up relative w-full"
        style={{ maxWidth: "520px" }}
      >
        {/* Card */}
        <div
          className="flex flex-col items-center rounded-[20px]"
          style={{
            background: "#ffffff",
            border: "1px solid #ffd1e6",
            boxShadow:
              "0 8px 40px rgba(255, 79, 163, 0.08), 0 2px 12px rgba(90, 0, 90, 0.04)",
            padding: "48px 36px",
            gap: "32px",
          }}
        >
          {/* Icon */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #ff4fa3, #ff85c1)",
              boxShadow: "0 4px 16px rgba(255, 79, 163, 0.2)",
            }}
          >
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>

          {/* Heading */}
          <div
            className="flex flex-col items-center text-center"
            style={{ gap: "12px" }}
          >
            <h1
              className="font-serif font-bold text-balance"
              style={{ fontSize: "28px", color: "#5a005a", lineHeight: 1.3 }}
            >
              Before You Continue
            </h1>
            <p
              className="font-sans"
              style={{
                fontSize: "15px",
                color: "#7a3a6a",
                lineHeight: 1.7,
              }}
            >
              Please review and acknowledge the following before creating your
              account.
            </p>
          </div>

          {/* Disclaimer content */}
          <div
            className="w-full rounded-2xl"
            style={{
              background: "#fff5fa",
              border: "1px solid #ffd1e6",
              padding: "24px",
            }}
          >
            <div className="flex flex-col" style={{ gap: "16px" }}>
              {[
                "KUNDLI is a compatibility assistance platform designed to help users evaluate traditional compatibility metrics.",
                "We do not guarantee relationship success or any particular outcome.",
                "We do not force, influence, or control any personal decisions you make.",
                "All compatibility insights are for informational purposes only. All decisions remain entirely your responsibility.",
              ].map((text, i) => (
                <div
                  key={i}
                  className="flex items-start"
                  style={{ gap: "12px" }}
                >
                  <div
                    className="mt-1 shrink-0 rounded-full"
                    style={{
                      width: "6px",
                      height: "6px",
                      background: "#ff4fa3",
                    }}
                  />
                  <p
                    className="font-sans"
                    style={{
                      fontSize: "14px",
                      color: "#5a005a",
                      lineHeight: 1.6,
                    }}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex w-full flex-col" style={{ gap: "16px" }}>
            <label
              className="flex cursor-pointer items-start rounded-xl transition-colors duration-200"
              style={{
                gap: "14px",
                padding: "16px",
                background: checkOne ? "#fff0f6" : "transparent",
                border: checkOne
                  ? "1px solid #ff4fa3"
                  : "1px solid #ffd1e6",
              }}
            >
              <input
                type="checkbox"
                checked={checkOne}
                onChange={(e) => setCheckOne(e.target.checked)}
                className="sr-only"
              />
              <div
                className="mt-0.5 flex shrink-0 items-center justify-center rounded-md transition-all duration-200"
                style={{
                  width: "22px",
                  height: "22px",
                  border: checkOne
                    ? "2px solid #ff4fa3"
                    : "2px solid #d1a8c0",
                  background: checkOne ? "#ff4fa3" : "#ffffff",
                }}
              >
                {checkOne && (
                  <svg
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="font-sans"
                style={{
                  fontSize: "14px",
                  color: "#5a005a",
                  lineHeight: 1.6,
                }}
              >
                I understand that KUNDLI only provides compatibility insights
                and does not guarantee relationship outcomes.
              </span>
            </label>

            <label
              className="flex cursor-pointer items-start rounded-xl transition-colors duration-200"
              style={{
                gap: "14px",
                padding: "16px",
                background: checkTwo ? "#fff0f6" : "transparent",
                border: checkTwo
                  ? "1px solid #ff4fa3"
                  : "1px solid #ffd1e6",
              }}
            >
              <input
                type="checkbox"
                checked={checkTwo}
                onChange={(e) => setCheckTwo(e.target.checked)}
                className="sr-only"
              />
              <div
                className="mt-0.5 flex shrink-0 items-center justify-center rounded-md transition-all duration-200"
                style={{
                  width: "22px",
                  height: "22px",
                  border: checkTwo
                    ? "2px solid #ff4fa3"
                    : "2px solid #d1a8c0",
                  background: checkTwo ? "#ff4fa3" : "#ffffff",
                }}
              >
                {checkTwo && (
                  <svg
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span
                className="font-sans"
                style={{
                  fontSize: "14px",
                  color: "#5a005a",
                  lineHeight: 1.6,
                }}
              >
                I agree to the{" "}
                <span
                  className="cursor-pointer underline"
                  style={{ color: "#ff4fa3" }}
                >
                  Terms & Conditions
                </span>{" "}
                and{" "}
                <span
                  className="cursor-pointer underline"
                  style={{ color: "#ff4fa3" }}
                >
                  Privacy Policy
                </span>
                .
              </span>
            </label>
          </div>

          {/* Proceed button */}
          <button
            disabled={!canProceed}
            onClick={() => router.push("/auth")}
            className="w-full cursor-pointer transition-all duration-300 ease-out"
            style={{
              padding: "18px 36px",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.6px",
              background: canProceed
                ? "linear-gradient(90deg, #ff4fa3, #ff2d55)"
                : "#e8c6d8",
              color: "#ffffff",
              border: "none",
              boxShadow: canProceed
                ? "0 8px 24px rgba(255, 45, 85, 0.35)"
                : "none",
              opacity: canProceed ? 1 : 0.7,
              transform: canProceed ? "none" : "none",
              cursor: canProceed ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (canProceed) {
                e.currentTarget.style.transform =
                  "translateY(-3px) scale(1.02)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
            }}
          >
            Proceed to Sign Up
          </button>

          {/* Back link */}
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer font-sans transition-colors duration-200"
            style={{
              fontSize: "14px",
              color: "#7a3a6a",
              background: "none",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ff4fa3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#7a3a6a";
            }}
          >
            &larr; Back to Home
          </button>
        </div>

        {/* Decorative bottom heart */}
        <div className="mt-8 flex justify-center">
          <Heart
            className="h-5 w-5 animate-float opacity-40"
            style={{ color: "#ff4fa3" }}
            fill="#ff4fa3"
          />
        </div>
      </div>
    </div>
  );
}
