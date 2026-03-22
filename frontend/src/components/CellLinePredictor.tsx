import React, { useState, useEffect } from "react";
import { fetchCellLines, predictCellLine, CellLineInfo } from "../api";
import { Activity, AlertCircle, ChevronRight, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const CellLinePredictor: React.FC = () => {
    const [cellLines, setCellLines] = useState<CellLineInfo[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [fetchingIds, setFetchingIds] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadIds = async () => {
            try {
                const lines = await fetchCellLines();
                setCellLines(lines);
                if (lines.length > 0) setSelectedId(lines[0].model_id);
            } catch (err: any) {
                setError("Failed to fetch cell line IDs from server. Is the backend running?");
            } finally {
                setFetchingIds(false);
            }
        };
        loadIds();
    }, []);

    const selectedInfo = cellLines.find(c => c.model_id === selectedId);

    const handlePredict = async () => {
        if (!selectedId) return;
        setLoading(true);
        setError(null);

        try {
            const data = await predictCellLine(selectedId);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Failed to analyze cell line");
        } finally {
            setLoading(false);
        }
    };

    const chartData = result?.attention_weights?.map((weight: number, i: number) => ({
        index: i,
        weight: weight,
    })) || [];

    return (
        <div className="flex flex-col h-full animate-fade-in pb-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-emerald-300">
                    Cell Line Sensitivity
                </h2>
                <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-2xl">
                    Strategy B: Select a cancer cell line to predict its relative sensitivity rank against other cell lines.
                </p>
            </div>

            <div className="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 mb-8 shadow-xl shadow-black/20 overflow-hidden">
                <label className="block text-sm font-medium text-primary-50 mb-3">
                    Select Cancer Cell Line
                </label>

                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <select
                        value={selectedId}
                        onChange={(e) => {
                            setSelectedId(e.target.value);
                            setResult(null);
                        }}
                        disabled={fetchingIds || cellLines.length === 0}
                        className="flex-1 min-w-0 bg-dark-900 border border-gray-600/50 rounded-xl p-3 text-primary-50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all focus:outline-none appearance-none cursor-pointer disabled:cursor-wait disabled:opacity-50"
                    >
                        {fetchingIds ? (
                            <option>Loading cell lines...</option>
                        ) : cellLines.length === 0 ? (
                            <option>No cell lines available</option>
                        ) : (
                            cellLines.map((cl) => (
                                <option key={cl.model_id} value={cl.model_id}>
                                    {cl.name} — {cl.disease} ({cl.model_id})
                                </option>
                            ))
                        )}
                    </select>

                    <button
                        onClick={handlePredict}
                        disabled={loading || !selectedId}
                        className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 whitespace-nowrap"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Activity className="animate-pulse" size={18} /> Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Predict <ChevronRight size={18} />
                            </span>
                        )}
                    </button>
                </div>

                <p className="text-xs flex items-center gap-2 text-gray-500 px-1">
                    <AlertCircle size={14} className="text-primary-500/70" />
                    Optimized for ranking cell lines, not calculating absolute probabilities
                </p>

                {error && (
                    <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {result && (
                <div className="space-y-6 animate-slide-up">
                    <div className="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 relative overflow-hidden shadow-xl shadow-black/20 flex flex-col items-center py-10">
                        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -trangray-y-1/2 trangray-x-1/2 pointer-events-none ${result.percentile_rank >= 70 ? 'bg-emerald-500/10' :
                            result.percentile_rank >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'
                            }`} />

                        {/* Cell line identity */}
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-white">{result.cell_line_name || selectedInfo?.name || selectedId}</h3>
                            <p className="text-sm text-primary-400 mt-1">{result.disease || selectedInfo?.disease || "Unknown"}</p>
                            <p className="text-xs text-gray-500 mt-0.5 font-mono">{result.model_id}</p>
                        </div>

                        <p className="text-gray-400 font-medium uppercase tracking-widest text-xs mb-3">Relative Sensitivity Rank</p>

                        <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-2xl text-gray-400">Top</span>
                            <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400">
                                {result.percentile_rank}
                            </span>
                            <span className="text-3xl text-primary-500 font-bold">%</span>
                        </div>

                        {result.percentile_rank >= 70 ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <TrendingUp size={18} />
                                <span className="text-sm font-semibold">High relative sensitivity</span>
                            </div>
                        ) : result.percentile_rank >= 40 ? (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <CheckCircle2 size={18} />
                                <span className="text-sm font-semibold">Moderate relative sensitivity</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                <TrendingDown size={18} />
                                <span className="text-sm font-semibold">Low relative sensitivity</span>
                            </div>
                        )}
                    </div>

                    <div className="bg-dark-800 border border-gray-700/50 rounded-2xl p-6 shadow-xl shadow-black/20">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-primary-50">Mutation Importance (Attention)</h3>
                            <p className="text-sm text-gray-400">Identifies which mutation groups strongly influenced this prediction</p>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                    <XAxis
                                        dataKey="index"
                                        stroke="#9CA3AF"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickMargin={10}
                                    />
                                    <YAxis
                                        stroke="#9CA3AF"
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickFormatter={(v) => v.toFixed(2)}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px' }}
                                        labelStyle={{ color: '#F9FAFB' }}
                                        formatter={(value: any) => [Number(value).toFixed(4), "Attention Weight"]}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        stroke="#14B8A6"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 6, fill: '#14B8A6', stroke: '#0D9488' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CellLinePredictor;
