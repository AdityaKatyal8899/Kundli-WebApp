import { Loader2 } from "lucide-react";

export default function LoadingButton({
    loading,
    children,
    className = "",
    ...props
}) {
    return (
        <button
            disabled={loading}
            className={`relative flex items-center justify-center transition-all duration-200 ${className} ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            {...props}
        >
            {loading && (
                <Loader2 className="absolute animate-spin h-5 w-5 text-white" />
            )}
            <span className={loading ? "opacity-0" : ""}>{children}</span>
        </button>
    );
}
