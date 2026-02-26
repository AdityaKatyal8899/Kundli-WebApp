import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function StatusCard({ type = "info", title, message }) {
    const styles = {
        success: {
            border: "border-pink-500/50",
            bg: "bg-pink-500/5",
            text: "text-pink-200",
            icon: <CheckCircle2 className="h-5 w-5 text-pink-500" />
        },
        error: {
            border: "border-red-500/50",
            bg: "bg-red-500/5",
            text: "text-red-200",
            icon: <AlertCircle className="h-5 w-5 text-red-500" />
        },
        info: {
            border: "border-purple-500/50",
            bg: "bg-purple-500/5",
            text: "text-purple-200",
            icon: <Info className="h-5 w-5 text-purple-500" />
        }
    };

    const current = styles[type] || styles.info;

    return (
        <div className={`flex gap-3 p-4 rounded-xl border ${current.border} ${current.bg} animate-in fade-in slide-in-from-top-2 duration-300`}>
            <div className="mt-0.5">{current.icon}</div>
            <div className="flex flex-col gap-1">
                {title && <h3 className={`font-semibold ${current.text} leading-tight`}>{title}</h3>}
                {message && <p className="text-sm opacity-80 text-white/90">{message}</p>}
            </div>
        </div>
    );
}
