import { useState, useEffect } from "react";
import { ArrowRight, Dna, FlaskConical, Microscope, Shield } from "lucide-react";

interface HomePageProps {
    onNavigate: (mode: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="w-full bg-[#0a0f16] text-white">
            {/* ============================== */}
            {/* HERO SECTION */}
            {/* ============================== */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 z-0"
                    style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                >
                    <img
                        src="/hero-bg.png"
                        alt=""
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f16]/60 via-transparent to-[#0a0f16]" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f16]/80 via-transparent to-[#0a0f16]/80" />
                </div>

                {/* Top Navigation */}
                <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-12 py-6">
                    <div className="flex items-center gap-2">
                        <Dna className="text-primary-500" size={28} />
                        <span className="text-xl font-bold tracking-wide">
                            DNA Drug <span className="text-primary-400">Response</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm">
                        <button className="text-primary-400 border-b border-primary-400 pb-0.5 font-medium">
                            Home
                        </button>
                        <button
                            onClick={() => onNavigate("cellline")}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Cell Lines
                        </button>
                        <button
                            onClick={() => onNavigate("dna")}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Custom DNA
                        </button>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 text-center max-w-4xl px-6">
                    <p className="text-primary-400 uppercase tracking-[0.3em] text-sm mb-6 font-medium">
                        Cisplatin Sensitivity Predictor
                    </p>
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                        Decode Drug
                        <br />
                        <span className="italic text-primary-400">Response</span>
                    </h1>

                    {/* Decorative underline */}
                    <svg
                        className="mx-auto mb-8"
                        width="200"
                        height="20"
                        viewBox="0 0 200 20"
                    >
                        <path
                            d="M10 15 Q50 0, 100 10 T190 5"
                            fill="none"
                            stroke="#14b8a6"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />
                    </svg>

                    <button
                        onClick={() => onNavigate("cellline")}
                        className="group inline-flex items-center gap-3 text-lg font-medium text-white hover:text-primary-400 transition-colors"
                    >
                        Explore Now
                        <ArrowRight
                            className="group-hover:translate-x-2 transition-transform text-primary-500"
                            size={22}
                        />
                    </button>
                </div>

                {/* Bottom Indicators */}
                <div className="absolute bottom-8 left-0 right-0 z-20 flex items-end justify-between px-12">
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                        <div className="w-10 h-10 rounded-full border border-primary-500/40 flex items-center justify-center">
                            <FlaskConical size={16} className="text-primary-400" />
                        </div>
                        <span>Research Demo</span>
                    </div>

                    <div className="flex flex-col items-center gap-2 text-gray-500 text-xs animate-bounce">
                        <div className="w-5 h-8 rounded-full border border-gray-600 flex items-start justify-center p-1">
                            <div className="w-1 h-2 bg-gray-400 rounded-full" />
                        </div>
                        <span>Scroll to explore</span>
                    </div>

                    <div className="flex items-center gap-4 text-gray-500">
                        <Shield size={16} />
                        <span className="text-xs">Not for clinical use</span>
                    </div>
                </div>
            </section>

            {/* ============================== */}
            {/* ABOUT SECTION */}
            {/* ============================== */}
            <section className="relative py-32 px-6 md:px-16 lg:px-24">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <p className="text-primary-400 uppercase tracking-[0.2em] text-xs font-semibold mb-4">
                                About the Project
                            </p>
                            <h2
                                className="text-4xl md:text-5xl font-bold leading-tight mb-6"
                                style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                            >
                                Predicting Cancer
                                <br />
                                Drug <span className="italic text-primary-400">Sensitivity</span>
                            </h2>
                            <p className="text-gray-400 leading-relaxed mb-6">
                                This application uses deep learning models trained on genomic
                                mutation data from the GDSC (Genomics of Drug Sensitivity in
                                Cancer) database. It analyses DNA mutation patterns to predict
                                how sensitive a cancer cell line might be to Cisplatin
                                treatment.
                            </p>
                            <p className="text-gray-500 leading-relaxed text-sm">
                                Built with a CNN encoder and attention pooling mechanism, the
                                model identifies which specific mutations contribute most to
                                drug response — providing both predictions and interpretability.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    icon: <Dna size={28} />,
                                    title: "DNA Analysis",
                                    desc: "One-hot encoded mutation sequences fed through deep CNN",
                                },
                                {
                                    icon: <Microscope size={28} />,
                                    title: "Cell Line Ranking",
                                    desc: "Rank cancer cell lines by predicted drug sensitivity",
                                },
                                {
                                    icon: <FlaskConical size={28} />,
                                    title: "Cisplatin Focus",
                                    desc: "Specialized model for Cisplatin drug response",
                                },
                                {
                                    icon: <Shield size={28} />,
                                    title: "Attention Maps",
                                    desc: "See which mutations influenced the prediction most",
                                },
                            ].map((card) => (
                                <div
                                    key={card.title}
                                    className="bg-dark-800/50 border border-gray-700/30 rounded-2xl p-6 hover:border-primary-500/30 transition-all group"
                                >
                                    <div className="text-primary-500 mb-4 group-hover:scale-110 transition-transform">
                                        {card.icon}
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{card.title}</h3>
                                    <p className="text-xs text-gray-500 leading-relaxed">
                                        {card.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================== */}
            {/* CTA SECTION */}
            {/* ============================== */}
            <section className="relative py-24 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2
                        className="text-3xl md:text-4xl font-bold mb-6"
                        style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
                    >
                        Ready to <span className="italic text-primary-400">Predict?</span>
                    </h2>
                    <p className="text-gray-400 mb-10">
                        Choose a prediction mode to get started.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => onNavigate("cellline")}
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary-600/20"
                        >
                            <Microscope size={20} />
                            Cell Line Model
                        </button>
                        <button
                            onClick={() => onNavigate("dna")}
                            className="px-8 py-4 bg-dark-800 border border-gray-700/50 hover:border-primary-500/40 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-all"
                        >
                            <Dna size={20} />
                            Custom DNA Input
                        </button>
                    </div>
                </div>
            </section>

            {/* ============================== */}
            {/* FOOTER */}
            {/* ============================== */}
            <footer className="border-t border-gray-800 py-8 px-12 flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-2">
                    <Dna size={14} className="text-primary-500" />
                    <span>DNA Drug Response Predictor</span>
                </div>
                <span>⚠️ Research & educational purposes only</span>
            </footer>
        </div>
    );
};

export default HomePage;
