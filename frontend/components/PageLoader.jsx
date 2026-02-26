export default function PageLoader() {
    return (
        <div className="flex items-center justify-center h-[300px]">
            <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 shadow-[0_0_15px_rgba(255,79,163,0.3)]"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <div className="h-4 w-4 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
