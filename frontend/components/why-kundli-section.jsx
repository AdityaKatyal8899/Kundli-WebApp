"use client";

import { Sparkles, ShieldCheck, FileText } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Intelligent Compatibility Analysis",
    description: "Deep structured guna matching insights.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy First",
    description: "No public kundli visibility.",
  },
  {
    icon: FileText,
    title: "Clear Explanations",
    description: "Detailed breakdown, not just score.",
  },
];

export default function WhyKundliSection() {
  return (
    <section
      id="why-kundli"
      className="bg-white"
      style={{ paddingTop: "80px", paddingBottom: "80px" }}
    >
      <div className="mx-auto max-w-[1100px] px-6">
        {/* Heading */}
        <div className="mb-16 flex flex-col items-center text-center" style={{ gap: "16px" }}>
          <h2
            className="font-serif font-bold"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#5a005a" }}
          >
            Why KUNDLI?
          </h2>
          <p
            className="font-sans"
            style={{
              fontSize: "18px",
              color: "#7a3a6a",
              maxWidth: "500px",
              lineHeight: 1.6,
            }}
          >
            Bridge between tradition and compatibility.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group flex cursor-default flex-col items-center rounded-2xl text-center transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "#fff0f6",
                  border: "1px solid #ffd1e6",
                  padding: "48px 32px",
                  boxShadow: "0 4px 20px rgba(255, 79, 163, 0.08)",
                }}
              >
                <div
                  className="mb-6 flex items-center justify-center rounded-full"
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "linear-gradient(135deg, #ff4fa3, #ff85c1)",
                  }}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3
                  className="mb-3 font-serif font-semibold"
                  style={{ fontSize: "20px", color: "#5a005a" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="font-sans"
                  style={{
                    fontSize: "15px",
                    color: "#7a3a6a",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
