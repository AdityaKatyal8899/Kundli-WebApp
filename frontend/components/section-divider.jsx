export default function SectionDivider({ fromColor = "#ffffff", toColor = "#fff5fa" }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: "64px", background: fromColor }}>
      <svg
        viewBox="0 0 1440 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 block w-full"
        preserveAspectRatio="none"
        style={{ height: "64px" }}
      >
        <path
          d="M0,32 C480,64 960,0 1440,32 L1440,64 L0,64 Z"
          fill={toColor}
        />
      </svg>
    </div>
  );
}
