"use client";

import { CalendarDays, MailCheck, UserRound, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";

const bulletPoints = [
  {
    icon: CalendarDays,
    text: "Enter birth details accurately",
  },
  {
    icon: MailCheck,
    text: "Verify your email",
  },
  {
    icon: UserRound,
    text: "Complete biodata & preferences",
  },
  {
    icon: FileUp,
    text: "Optional: upload existing kundli PDF",
  },
];

export default function CreateAccountSection() {
  const router = useRouter();

  return (
    <section
      id="create-account"
      className="bg-white"
      style={{ paddingTop: "80px", paddingBottom: "80px" }}
    >
      {/* Curved SVG divider */}
      <div className="mx-auto max-w-[900px] px-6">
        {/* Heading */}
        <div className="mb-12 flex flex-col items-center text-center" style={{ gap: "16px" }}>
          <h2
            className="font-serif font-bold text-balance"
            style={{ fontSize: "clamp(28px, 5vw, 42px)", color: "#5a005a" }}
          >
            Create Your Kundli Profile in Minutes
          </h2>
        </div>

        {/* Bullet Points */}
        <div className="mx-auto max-w-[560px]">
          <div className="flex flex-col" style={{ gap: "24px" }}>
            {bulletPoints.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-center rounded-xl"
                  style={{
                    gap: "24px",
                    padding: "24px 32px",
                    background: "#fff0f6",
                    border: "1px solid #ffd1e6",
                  }}
                >
                  <div
                    className="flex shrink-0 items-center justify-center rounded-full"
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "linear-gradient(135deg, #ff4fa3, #ff85c1)",
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <p
                    className="font-sans font-medium"
                    style={{
                      fontSize: "16px",
                      color: "#5a005a",
                      lineHeight: 1.5,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
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
            Create Your Profile
          </button>
        </div>
      </div>
    </section>
  );
}
