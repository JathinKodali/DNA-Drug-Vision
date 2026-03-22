import React from "react";
import { Dna, TestTube2, Home } from "lucide-react";

interface LayoutProps {
    children: React.ReactNode;
    activeMode: string;
    setActiveMode: (mode: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeMode, setActiveMode }) => {
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#0a0f16] text-white font-sans">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-8 md:px-12 py-4 bg-[#0a0f16]/80 backdrop-blur-xl border-b border-gray-700/30">
                {/* Logo / Home */}
                <button
                    onClick={() => setActiveMode("home")}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                    <Dna className="text-primary-500" size={24} />
                    <span className="text-lg font-bold tracking-wide">
                        DNA Drug <span className="text-primary-400">Response</span>
                    </span>
                </button>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setActiveMode("home")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeMode === "home"
                                ? "text-primary-400"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Home size={15} />
                            Home
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMode("cellline")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeMode === "cellline"
                                ? "text-primary-400 bg-primary-600/10 border border-primary-500/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <TestTube2 size={15} />
                            Cell Lines
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveMode("dna")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeMode === "dna"
                                ? "text-primary-400 bg-primary-600/10 border border-primary-500/20"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Dna size={15} />
                            Custom DNA
                        </span>
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full px-6 py-10 md:px-12 md:py-14">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800/50 py-5 px-12 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <Dna size={12} className="text-primary-500" />
                    <span>DNA Drug Response Predictor</span>
                </div>
                <span>⚠️ Research & educational purposes only</span>
            </footer>
        </div>
    );
};

export default Layout;
