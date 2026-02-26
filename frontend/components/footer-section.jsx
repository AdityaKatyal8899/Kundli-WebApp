export default function FooterSection() {
  return (
    <footer
      style={{
        background: "#fff5fa",
        paddingTop: "48px",
        paddingBottom: "48px",
        borderTop: "1px solid #ffd1e6",
      }}
    >
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between px-6 md:flex-row">
        {/* Left - Brand */}
        <div className="mb-6 md:mb-0">
          <span
            className="font-serif font-bold"
            style={{ fontSize: "24px", color: "#5a005a" }}
          >
            KUNDLI
          </span>
        </div>

        {/* Right - Links */}
        <nav className="flex items-center" style={{ gap: "32px" }}>
          <a
            href="#"
            className="font-sans transition-colors duration-200 hover:text-[#ff4fa3]"
            style={{
              fontSize: "14px",
              color: "#7a3a6a",
              textDecoration: "none",
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-sans transition-colors duration-200 hover:text-[#ff4fa3]"
            style={{
              fontSize: "14px",
              color: "#7a3a6a",
              textDecoration: "none",
            }}
          >
            Terms
          </a>
          <a
            href="#"
            className="font-sans transition-colors duration-200 hover:text-[#ff4fa3]"
            style={{
              fontSize: "14px",
              color: "#7a3a6a",
              textDecoration: "none",
            }}
          >
            Contact
          </a>
        </nav>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-8 max-w-[1100px] px-6 text-center md:text-left">
        <p
          className="font-sans"
          style={{ fontSize: "13px", color: "#7a3a6a", opacity: 0.6 }}
        >
          &copy; {new Date().getFullYear()} KUNDLI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
