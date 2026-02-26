"use client";

const steps = [
  {
    number: "01",
    title: "Create Your Profile",
    description: "Set up your account with basic details and preferences.",
  },
  {
    number: "02",
    title: "Upload Kundli Details",
    description: "Enter birth details or upload your existing kundli.",
  },
  {
    number: "03",
    title: "Match & Review",
    description: "Get intelligent compatibility analysis and insights.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      style={{
        paddingTop: "80px",
        paddingBottom: "80px",
        background: "#fff5fa",
      }}
    >
      {/* Curved divider top */}
      <div className="mx-auto max-w-[1100px] px-6">
        {/* Heading */}
        <div className="mb-16 flex flex-col items-center text-center" style={{ gap: "16px" }}>
          <h2
            className="font-serif font-bold"
            style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#5a005a" }}
          >
            How It Works
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
            Three simple steps to find your match.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center text-center"
              style={{ gap: "24px" }}
            >
              {/* Step Number Circle */}
              <div
                className="flex items-center justify-center rounded-full font-serif font-bold"
                style={{
                  width: "80px",
                  height: "80px",
                  background: "#ffffff",
                  border: "2px solid #ff4fa3",
                  fontSize: "24px",
                  color: "#ff4fa3",
                  boxShadow: "0 4px 16px rgba(255, 79, 163, 0.12)",
                }}
              >
                {step.number}
              </div>

              {/* Step Info */}
              <div className="flex flex-col items-center" style={{ gap: "8px" }}>
                <h3
                  className="font-serif font-semibold"
                  style={{ fontSize: "20px", color: "#5a005a" }}
                >
                  {step.title}
                </h3>
                <p
                  className="mx-auto max-w-[280px] font-sans"
                  style={{
                    fontSize: "15px",
                    color: "#7a3a6a",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
