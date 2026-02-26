import DashboardDock, { DashboardBranding } from "@/components/dashboard/dock";

export const metadata = {
  title: "Dashboard - KUNDLI",
  description:
    "Your personalized KUNDLI dashboard for profile management and compatibility matching.",
};

export default function DashboardLayout({ children }) {
  return (
    <div
      className="relative min-h-screen"
      style={{ background: "#2b004b" }}
    >
      <DashboardBranding />
      <main
        className="mx-auto w-full px-5 pb-28 pt-20 md:px-10 md:pt-16"
        style={{ maxWidth: "960px", minHeight: "100vh" }}
      >
        {children}
      </main>
      <DashboardDock />
    </div>
  );
}
