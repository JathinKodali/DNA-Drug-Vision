import React, { useState, useRef } from "react";
import { predictDNA } from "../api";
import {
    AlertCircle,
    Activity,
    ChevronRight,
    TestTube2,
    Upload,
    Sparkles,
    Info,
    FileText,
    X,
} from "lucide-react";

const EXAMPLE_SEQUENCES = [
    {
        name: "Sensitive Mutation",
        badge: "Sensitive",
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        description: "Cell line mutation linked to drug response",
        seq: "CGAGTTCCAGTTCGTCAGCGGCCGCGAGACGGCCAAGGACTGGAAGCGCAG",
    },
    {
        name: "Uncertain Pattern",
        badge: "Uncertain",
        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        description: "Pattern near the decision boundary",
        seq: "GTCTCGTTCTGCAGCCAGGACGGCAACCTTCCCACCCTCATATCCAGCGTC",
    },
    {
        name: "Resistant Mutation",
        badge: "Resistant",
        badgeColor: "text-red-400 bg-red-500/10 border-red-500/20",
        description: "Cell line mutation linked to drug resistance",
        seq: "CTGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGA",
    },
];

// The CNN model outputs scores in a very narrow range (~0.49–0.55).
// We rescale this to 0–1 so slight differences are visually meaningful.
const MODEL_MIN = 0.505;
const MODEL_MAX = 0.555;
function rescaleScore(raw: number): number {
    const scaled = (raw - MODEL_MIN) / (MODEL_MAX - MODEL_MIN);
    return Math.max(0, Math.min(1, scaled));
}

function parseFasta(text: string): string {
    return text
        .split("\n")
        .filter((line) => !line.startsWith(">"))
        .join("")
        .replace(/[^ATGCatgc]/g, "")
        .toUpperCase();
}

function getResultExplanation(displayScore: number): {
    headline: string;
    detail: string;
} {
    if (displayScore >= 0.7) {
        return {
            headline: "Strong predicted response",
            detail:
                "This sequence's mutational pattern is strongly associated with Cisplatin sensitivity in laboratory cell line models. In simpler terms, cells with DNA like this tended to respond well to the drug in lab experiments.",
        };
    }
    if (displayScore >= 0.55) {
        return {
            headline: "Moderate-to-high predicted response",
            detail:
                "This sequence shows patterns that are moderately associated with Cisplatin sensitivity. Lab cell lines with similar DNA showed a noticeable (but not the strongest) response to the drug.",
        };
    }
    if (displayScore >= 0.35) {
        return {
            headline: "Borderline / Uncertain",
            detail:
                "The model is not confident about this sequence. The mutational patterns don't clearly point toward sensitivity or resistance. More data or a longer sequence might help.",
        };
    }
    if (displayScore >= 0.15) {
        return {
            headline: "Lower predicted response",
            detail:
                "This sequence's patterns lean toward resistance in lab models. Cell lines with similar DNA tended to be less affected by Cisplatin in experiments.",
        };
    }
    return {
        headline: "Weak predicted response",
        detail:
            "The mutational pattern in this sequence is associated with Cisplatin resistance in lab cell lines. This means cells with similar DNA typically did not respond to the drug in laboratory settings.",
    };
}

const CustomDNAPredictor: React.FC = () => {
    const [dna, setDna] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ sensitivity_score: number } | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePredict = async () => {
        if (!dna || dna.length < 10) {
            setError("Please enter a valid DNA sequence (minimum 10 bases).");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const data = await predictDNA(dna);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze DNA");
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            const cleaned = file.name.endsWith(".fasta") || file.name.endsWith(".fa")
                ? parseFasta(text)
                : text.replace(/[^ATGCatgc]/g, "").toUpperCase();
            setDna(cleaned);
            setResult(null);
            setError(null);
        };
        reader.readAsText(file);
    };

    const loadExample = (seq: string) => {
        setDna(seq);
        setResult(null);
        setError(null);
        setFileName(null);
    };

    const displayScore = result ? rescaleScore(result.sensitivity_score) : 0;
    const explanation = result ? getResultExplanation(displayScore) : null;

    return (
        <div className="flex flex-col h-full animate-fade-in pb-12">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-emerald-300">
                    Custom DNA Sensitivity
                </h2>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-2xl">
                    Paste or upload a DNA sequence to estimate how well it might respond to
                    <strong className="text-primary-400"> Cisplatin</strong> treatment,
                    based on patterns the model learned from cancer cell line experiments.
                </p>
            </div>

            {/* Info banner for general users */}
            <div className="flex items-start gap-3 bg-primary-600/10 border border-primary-500/20 rounded-xl p-4 mb-6 text-sm text-primary-200">
                <Info size={18} className="shrink-0 mt-0.5 text-primary-400" />
                <div>
                    <strong>How does this work?</strong> The model looks at short DNA
                    sequences (up to 51 bases) and compares their patterns against
                    thousands of cancer cell line mutations to predict drug sensitivity.
                    <br />
                    <span className="text-gray-400">
                        Don't have a sequence handy? Try one of the examples below!
                    </span>
                </div>
            </div>

            {/* Example buttons */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Quick Examples
                </p>
                <div className="flex flex-wrap gap-2">
                    {EXAMPLE_SEQUENCES.map((ex) => (
                        <button
                            key={ex.name}
                            onClick={() => loadExample(ex.seq)}
                            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-gray-700/50 rounded-xl text-sm text-gray-300 hover:border-primary-500/40 hover:text-primary-300 transition-all group"
                        >
                            <Sparkles
                                size={14}
                                className="text-gray-600 group-hover:text-primary-400 transition-colors"
                            />
                            <div className="text-left flex items-center gap-2">
                                <span className="font-medium">{ex.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ex.badgeColor}`}>
                                    {ex.badge}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Input card */}
            <div className="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-primary-50">
                        DNA Sequence (A / T / G / C only)
                    </label>
                    <span
                        className={`text-xs font-mono px-2 py-0.5 rounded-full ${dna.length === 0
                            ? "text-gray-500 bg-dark-900"
                            : dna.length < 10
                                ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                                : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                            }`}
                    >
                        {dna.length} bases{dna.length > 0 && dna.length < 10 && " (need ≥ 10)"}
                    </span>
                </div>

                <textarea
                    value={dna}
                    onChange={(e) => {
                        setDna(e.target.value.toUpperCase().replace(/[^ATGC]/g, ""));
                        setFileName(null);
                    }}
                    placeholder="Paste a sequence here, or use an example above…"
                    className="w-full h-36 bg-dark-900 border border-gray-600/50 rounded-xl p-4 text-primary-50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all font-mono text-sm resize-none placeholder-gray-600 focus:outline-none"
                />

                {/* File upload row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-5">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".txt,.fasta,.fa"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-gray-400 hover:text-primary-300 px-3 py-2 text-sm border border-gray-700/50 rounded-lg hover:border-primary-500/30 transition-all"
                        >
                            <Upload size={16} />
                            Upload .fasta / .txt
                        </button>
                        {fileName && (
                            <span className="flex items-center gap-1.5 text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full border border-primary-500/20">
                                <FileText size={12} />
                                {fileName}
                                <button
                                    onClick={() => {
                                        setFileName(null);
                                        setDna("");
                                    }}
                                    className="ml-1 hover:text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        <button
                            onClick={() => {
                                setDna("");
                                setResult(null);
                                setError(null);
                                setFileName(null);
                            }}
                            className="text-gray-500 hover:text-white text-sm transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    <button
                        onClick={handlePredict}
                        disabled={loading || dna.length < 10}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Activity className="animate-pulse" size={18} /> Analyzing…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Predict Sensitivity <ChevronRight size={18} />
                            </span>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && explanation && (
                <div className="bg-dark-800 border border-gray-700/50 rounded-2xl p-8 relative overflow-hidden animate-slide-up shadow-xl shadow-black/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                            <TestTube2 size={20} />
                        </div>
                        <h3 className="text-xl font-semibold">Analysis Results</h3>
                    </div>

                    {/* Score visual */}
                    <div className="flex flex-col items-center justify-center py-4">
                        <p className="text-sm text-gray-400 mb-2 uppercase tracking-wider font-semibold">
                            Predicted Sensitivity Score
                        </p>
                        <div className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-500 mb-4 font-mono">
                            {result.sensitivity_score.toFixed(3)}
                        </div>
                        <p className="text-xs text-gray-500 mb-4">Raw model output (rescaled below for visual clarity)</p>

                        <div className="w-full max-w-md bg-dark-900 h-3 rounded-full overflow-hidden border border-gray-700/50 mb-2">
                            <div
                                className={`h-full transition-all duration-1000 ease-out ${displayScore >= 0.55
                                    ? "bg-emerald-500"
                                    : displayScore >= 0.35
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                    }`}
                                style={{ width: `${displayScore * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between w-full max-w-md text-[10px] text-gray-600 px-1">
                            <span>Resistant</span>
                            <span>Uncertain</span>
                            <span>Sensitive</span>
                        </div>
                    </div>

                    {/* Plain-language explanation */}
                    <div className="mt-6 bg-dark-900/60 rounded-xl p-5 border border-gray-700/30">
                        <p className="font-semibold text-primary-50 mb-1.5 flex items-center gap-2">
                            {displayScore >= 0.55 ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                            ) : displayScore >= 0.35 ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                            ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                            )}
                            {explanation.headline}
                        </p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {explanation.detail}
                        </p>
                    </div>

                    <p className="mt-5 text-xs text-gray-600 text-center">
                        ⚠️ This is a research tool trained on laboratory cell line data and
                        does <strong>not</strong> predict real-world clinical outcomes.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CustomDNAPredictor;
