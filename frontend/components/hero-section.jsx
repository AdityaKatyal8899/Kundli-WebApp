"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #ff4fa3 0%, #ff85c1 35%, #ffffff 100%)",
      }}
    >
      {/* Subtle constellation dots */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 mx-auto flex max-w-[900px] flex-col items-center px-6 text-center"
        style={{ gap: "0px" }}
      >
        {/* Small decorative icon */}
        <div className="animate-fade-in mb-6 animate-float">
          <Heart className="h-8 w-8 text-white opacity-80" fill="white" />
        </div>

        {/* Title */}
        <h1
          className="animate-fade-in-up font-serif font-bold tracking-tight"
          style={{
            fontSize: "clamp(48px, 8vw, 72px)",
            color: "#5a005a",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          KUNDLI
        </h1>

        {/* Subheading - 24px gap from title */}
        <p
          className="animate-fade-in-up animation-delay-200 font-sans font-medium uppercase tracking-widest"
          style={{
            marginTop: "24px",
            fontSize: "14px",
            color: "#7a3a6a",
            letterSpacing: "0.2em",
          }}
        >
          Modern Kundli Matching Platform
        </p>

        {/* Hindi Quote - 24px gap from subheading */}
        <p
          className="animate-fade-in-up animation-delay-400"
          style={{
            marginTop: "24px",
            fontSize: "20px",
            lineHeight: 1.6,
            color: "#ff2d55",
            fontFamily: "var(--font-hindi), sans-serif",
          }}
        >
          {"जहाँ परंपरा मिलती है आधुनिकता से, वहीं बनती है सच्ची जोड़ी"}
        </p>

        {/* Buttons - 32px gap from quote */}
        <div
          className="animate-fade-in-up animation-delay-600 flex flex-wrap items-center justify-center"
          style={{ marginTop: "32px", gap: "16px" }}
        >
          <button
            onClick={() => router.push("/agreement")}
            className="cursor-pointer transition-all duration-300 ease-out hover:-translate-y-[3px] hover:scale-[1.02]"
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
            Get Started
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("why-kundli");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="cursor-pointer transition-all duration-300 ease-out hover:bg-[#ffe6f2]"
            style={{
              padding: "18px 36px",
              borderRadius: "999px",
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.6px",
              background: "#ffffff",
              color: "#ff2d55",
              border: "2px solid #ff4fa3",
            }}
          >
            Learn More
          </button>
        </div>

        {/* Tagline - 24px gap from buttons */}
        <p
          className="animate-fade-in animation-delay-600"
          style={{
            marginTop: "24px",
            fontSize: "14px",
            fontStyle: "italic",
            color: "#7a3a6a",
            opacity: 0.7,
          }}
        >
          Where tradition meets technology, love finds its way.
        </p>
      </div>

      {/* Curved SVG divider at the bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
          style={{ height: "80px" }}
        >
          <path
            d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}
